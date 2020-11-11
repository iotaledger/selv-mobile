import { KEY_ID, IOTA_NODE_URL, MINIMUM_WEIGHT_MAGNITUDE, DEPTH, DEFAULT_TAG, DEVNET } from '~/lib/config';
import Keychain from '~/lib/keychain';
import { Schemas, SchemaNames, DIDMapping } from '~/lib/identity/schemas';
import { parse } from '~/lib/helpers';
import type { InternalCredentialDataModel } from '~/lib/store';
import * as IotaIdentity from "iota-identity-wasm-test/web";

/**
 * Personal identity object
 */
export type Identity = {
    didDoc: string;
    publicAuthKey: string;
    privateAuthKey: string;
};

/**
 * Schema name (as key) with credentials (as value)
 */
export type SchemaNamesWithCredentials = {
    [key in SchemaNames]: any;
};

/**
 * Creates new identity
 *
 * @method createIdentity
 *
 * @returns {Promise<Identity>}
 */
export const createIdentity = (): Promise<Identity> => {
    return new Promise<Identity>(async (resolve, reject) => {
        //Initialize the Library - Is cached after first initialization
        let currentTime = Date.now();
        await IotaIdentity.init();
        console.log("Lib load time (ms): ", Date.now() - currentTime);
        currentTime = Date.now();

        //Generate a new keypair
        const {key, doc} = IotaIdentity.Doc.generateEd25519("main");
        console.log("Key Gen time (ms): ", Date.now() - currentTime);
        currentTime = Date.now();
        console.log("Generated new Identity");
        console.log("Key: ", key.private);
        console.log("Did Doc: ", doc.toJSON());

        //Signing
        doc.sign(key);
        console.log("Sign time (ms): ", Date.now() - currentTime);
        currentTime = Date.now();
        console.log("Signed Doc: ", doc.toJSON());

        //Publish
        await IotaIdentity.publish(doc.toJSON(), { node: IOTA_NODE_URL, network: DEVNET ? "dev" : undefined })
        console.log("Publish time (ms): ", Date.now() - currentTime);
        resolve({didDoc: JSON.stringify(doc.toJSON()), publicAuthKey: key.public, privateAuthKey: key.private});
    });
}

/**
 * Stores identity in keychain
 *
 * @method storeIdentity
 *
 * @param {string} identifier
 * @param {Identity} identity
 *
 * @returns {Promise}
 */
export const storeIdentity = (identifier: string, identity: Identity): Promise<{ value: boolean }> => {
    return Keychain.set(identifier, JSON.stringify(identity));
};

/**
 * Stores identity in keychain
 *
 * @method retrieveIdentity
 *
 * @param {string} identifier
 *
 * @returns {Promise}
 */
export const retrieveIdentity = (identifier = 'did'): Promise<Identity> => {
    return Keychain.get(identifier)
        .then((data) => parse(data.value))
        .catch(() => null);
};

export const retrieveCredentials = (ids: string[]): Promise<InternalCredentialDataModel[]> => {
    return Promise.all(ids.map((id) => Keychain.get(id) ))
        .then((data) => data.map((entry) => parse(entry.value) ))
        .catch((e) => {
            console.error(e);
            return [];
        });
};

/**
 * Creates credential
 *
 * @method createSelfSignedCredential
 *
 * @param {Identity} issuer
 * @param {SchemaNames} schemaName
 * @param {any} data
 *
 * @returns {Promise<VerifiableCredentialDataModel>}
 */
export const createSelfSignedCredential = async (
    issuer: Identity,
    schemaName: SchemaNames,
    data: any
): Promise<IotaIdentity.VerifiableCredential> => {
    return new Promise<IotaIdentity.VerifiableCredential>(async (resolve, reject) => {
        console.log("Creating Credential: ", schemaName);
        //Initialize the Library - Is cached after first initialization
        await IotaIdentity.init();

        //Prepare credential Data
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
        console.log("Credential Created: ", schemaName);
        resolve(vc.toJSON());
    });
};

/**
 * Stores credential in keychain
 *
 * @method storeCredential
 *
 * @param {string} credentialId
 * @param {VerifiableCredentialDataModel} credential
 *
 * @returns {Promise<{ value: boolean }>}
 */
export const storeCredential = (credentialId: string, credential: InternalCredentialDataModel): Promise<{ value: boolean }> => {
    return Keychain.set(credentialId, JSON.stringify(credential));
};

/**
 * Remove credential from keychain
 *
 * @method removeCredential
 *
 * @param {string} credentialId
 *
 * @returns {Promise<{ value: boolean }>}
 */
export const removeCredential = (credentialId: string): Promise<boolean> => {
    return Keychain.remove(credentialId);
};

/**
 * Retrieves credential from keychain
 *
 * @method retrieveCredential
 *
 * @param {string} credentialId
 *
 * @returns {Promise<VerifiableCredentialDataModel>}
 */
export const retrieveCredential = (credentialId: string): Promise<IotaIdentity.VerifiableCredential> => {
    return Keychain.get(credentialId)
        .then( async (data) => 
            parse(data.value)
        )
        .catch(() => null);
};

/**
 * Creates verifiable presentations for provided schema names
 *
 * @method createVerifiablePresentations
 *
 * @param {Identity} issuer
 * @param {SchemaNamesWithCredentials} schemaNamesWithCredentials
 * @param {string} challengeNonce
 *
 * @returns {Promise<VerifiablePresentationDataModel>}
 */
export const createVerifiablePresentation = (
    issuer: Identity,
    credentials : any[],
    challengeNonce: string
): Promise<IotaIdentity.VerifiablePresentation> => {
    return new Promise<IotaIdentity.VerifiablePresentation>( async (resolve, reject) => {
        //Initialize the Library - Is cached after first initialization
        await IotaIdentity.init();

        //Prepare some variables
        let issuerDid = IotaIdentity.Doc.fromJSON(JSON.parse(issuer.didDoc));
        let issuerKeypair = IotaIdentity.Key.fromBase58(issuer.publicAuthKey, issuer.privateAuthKey);

        //Create a DID Authentication Credential
        let didAuthCred = new IotaIdentity.VerifiableCredential(
            issuerDid,
            issuerKeypair,
            { DID: issuerDid.id, challengeNonce: challengeNonce},
            "DIDAuthenticationCredential"
        );

        //Add the credentials
        let vcs : IotaIdentity.VerifiableCredential[] = [didAuthCred];
        for(let i=0; i < credentials.length; i++) {
            vcs.push(IotaIdentity.VerifiableCredential.fromJSON(credentials[i]));
        }

        //Create the Presentation
        let vp = new IotaIdentity.VerifiablePresentation(issuerDid, issuerKeypair, vcs);
        console.log(vp.toJSON());
        resolve(vp);
    });
};

export const verifyVerifiablePresentation = (presentation: any, challenge : string|number): Promise<boolean> => {
    return new Promise<boolean>(async (resolve, reject) => {
        //Initialize the Library - Is cached after first initialization
        await IotaIdentity.init();
        try {
            //Create from VP
            let vp = IotaIdentity.VerifiablePresentation.fromJSON(presentation);

            let result : boolean = IotaIdentity.checkPresentation(vp.toString(), { network: DEVNET?"dev":"main", node: IOTA_NODE_URL});
            let challengeNonce : string = vp.toJSON()["verifiableCredential"][0]["credentialSubject"]["challengeNonce"];
            //Nonce Challenge
            let challengeResult = false;
            if(typeof challenge === "string") {
                challengeResult = (challenge == challengeNonce);
            } else { //Time Challenge
                challengeResult = (parseInt(challengeNonce) > challenge);
            }
            resolve(result && challengeResult);
        } catch (err) {
            reject("Error during VP Check: " + err);
        } 
    });
};

export type VerifiableCredentialEnrichment = {
    issuerLabel: string;
    logo: string;
    credentialLabel: string;
    theme: string;
};

export const enrichCredential = (credential: any): Promise<VerifiableCredentialEnrichment> => {
    const override = DIDMapping[credential.issuer];
    return new Promise((resolve, reject) => {
        const enrichment = {
            issuerLabel: override?.issuerLabel ?? 'selv', // credential.issuer
            logo: override?.logo ?? 'personal',
            credentialLabel: credential?.type[1],
            theme: override?.theme ?? '#550000',
        };
        resolve(enrichment);
    });
};

export const prepareCredentialForDisplay = (credential: any): any => {
    // TODO: deep copy
    const copy = { ...credential, credentialSubject: { ...credential.credentialSubject } };
    // TODO: typing
    if ((copy.credentialSubject as any).DID) {
        delete (copy.credentialSubject as any).DID;
    }
    return copy;
};
