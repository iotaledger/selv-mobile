import { Schemas, SchemaNames } from './ui/lib/identity/schemas';
import * as IotaIdentity from "iota-identity-wasm-test/node";

import { KEY_ID, IOTA_NODE_URL, MINIMUM_WEIGHT_MAGNITUDE, DEPTH, DEFAULT_TAG, DEVNET } from './ui/lib/config';
import type { Identity } from './ui/lib/identity';

const QRCode = require('qrcode-svg');

const fs = require('fs');

var pako = require('pako');

const WORKDIR = '.cli';

const IDENTITYFILE = `${WORKDIR}/identity.json`;
const QRCREDENTIALFILE = `${WORKDIR}/credential.svg`;
const args = process.argv.slice(2);

if (!args[0]) {
    console.error('no schema name supplied');
    process.exit(1);
}

if (!Schemas[args[0] as SchemaNames]) {
    console.error('schema not found');
    process.exit(1);
}

if (!args[1]) {
    console.error('no data source provided');
    process.exit(1);
}

if (!fs.existsSync(args[1])) {
    console.error('data source could not be resolved');
    process.exit(1);
}

const schemaName = args[0];
const dataPath = args[1];

const createIdentity = (): Promise<Identity> => {
    return new Promise<Identity>(async (resolve, reject) => {
        try {
            //Create Identity
            const {key, doc} = IotaIdentity.Doc.generateEd25519();
            doc.sign(key);
            //Publish Identity
            await IotaIdentity.publish(doc.toJSON(), {node: IOTA_NODE_URL, network: DEVNET?"dev":"main"});
            resolve({ didDoc: JSON.stringify(doc.toJSON()), publicAuthKey : key.public, privateAuthKey : key.private });
        } catch(err) {
            reject("Error during Identity Creation: " + err);
        }
    });
};

const createCredential = (
    issuer: Identity,
    schemaName: SchemaNames,
    data: any
): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
        let IssuerDidDoc = IotaIdentity.Doc.fromJSON(JSON.parse(issuer.didDoc));
        const credentialData = {
            id: IssuerDidDoc.id,
            ...data
        };

        //Takes IssuerDoc, IssuerKey, CredentialSchemaURL, CredentialSchemaName, Data
        let vc = new IotaIdentity.VerifiableCredential( 
            IssuerDidDoc,
            IotaIdentity.Key.fromBase58(issuer.publicAuthKey, issuer.privateAuthKey),
            credentialData,
            schemaName
        );
        resolve(vc.toJSON());
    });
};

const getIdentity = () =>
    new Promise<Identity>((resolve, reject) => {
        if (fs.existsSync(IDENTITYFILE)) {
            resolve(JSON.parse(fs.readFileSync(IDENTITYFILE, 'utf8')));
        } else {
            console.info('creating new identity');
            createIdentity()
                .then((identity) => {
                    console.info('identity created');
                    if (!fs.existsSync('.cli')) {
                        fs.mkdirSync('.cli');
                    }
                    fs.writeFile(IDENTITYFILE, JSON.stringify(identity), (err: Error) => {
                        if (err) return console.error(err);
                        console.info('identity stored');
                        resolve(identity);
                    });
                })
                .catch((e) => console.error(e));
        }
    });

getIdentity().then((identity) => {
    console.info('using identity', identity);
    createCredential(identity, schemaName as SchemaNames, JSON.parse(fs.readFileSync(dataPath, 'utf8'))).then(
        (credential) => {
            console.info('credential created');
            const strigifiedCredential = JSON.stringify(credential);
            const compressedCredential = pako.deflate(strigifiedCredential, { to: 'string' });
            const qrData = JSON.stringify({ cp: compressedCredential });
            const qrcode = new QRCode({
                content: qrData,
                padding: 40,
                width: 280,
                height: 280,
                color: '#000000',
                join: true,
                background: '#ffffff',
                ecl: 'L',
            });
            qrcode.save(QRCREDENTIALFILE, (error: Error) => {
                if (error) throw error;
                console.info('Done!');
            });
        }
    );
});
