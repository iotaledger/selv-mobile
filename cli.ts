import {
    Credential,
    GenerateECDSAKeypair,
    GenerateSeed,
    CreateRandomDID,
    DIDPublisher,
    VerifiableCredentialDataModel,
    DIDDocument,
    Schema,
    ProofTypeManager,
    VerifiableCredential,
} from '@iota/identity';
import { Schemas, SchemaNames } from './ui/lib/identity/schemas';

import { KEY_ID, IOTA_NODE_URL, MINIMUM_WEIGHT_MAGNITUDE, DEPTH, DEFAULT_TAG } from './ui/lib/config';
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
    const seed = GenerateSeed();
    const userDIDDocument = CreateRandomDID(seed);

    return GenerateECDSAKeypair().then((keypair) => {
        const privateKey = keypair.GetPrivateKey();
        userDIDDocument.AddKeypair(keypair, KEY_ID);

        const publisher = new DIDPublisher(IOTA_NODE_URL, seed);

        return publisher.PublishDIDDocument(userDIDDocument, DEFAULT_TAG, MINIMUM_WEIGHT_MAGNITUDE, DEPTH).then((root) => {
            const mamState = publisher.ExportMAMChannelState();

            return { keyId: KEY_ID, seed, root, privateKey, mamState };
        });
    });
};

const createCredential = (
    issuer: Identity,
    schemaName: SchemaNames,
    data: any,
    revocationAddress: string
): Promise<VerifiableCredentialDataModel> => {
    return DIDDocument.readDIDDocument(IOTA_NODE_URL, issuer.root).then((issuerDID) => {
        const keypair = issuerDID.GetKeypair(issuer.keyId).GetEncryptionKeypair();

        // Set the private key, this enables the keypair to sign.
        keypair.SetPrivateKey(issuer.privateKey);

        const credentialData = {
            DID: issuerDID.GetDID().GetDID(),
            ...data,
        };

        const credential = Credential.Create(
            new Schema(schemaName, Schemas[schemaName]),
            issuerDID.GetDID(),
            credentialData,
            revocationAddress
        );

        // Sign the schema
        const proof = ProofTypeManager.GetInstance().CreateProofWithBuilder('EcdsaSecp256k1VerificationKey2019', {
            issuer: issuerDID,
            issuerKeyId: issuer.keyId,
        });

        proof.Sign(credential.EncodeToJSON()); // Signs the JSON document

        const verifiableCredential = VerifiableCredential.Create(credential, proof);

        return verifiableCredential.EncodeToJSON();
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
    createCredential(identity, schemaName as SchemaNames, JSON.parse(fs.readFileSync(dataPath, 'utf8')), undefined).then(
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
