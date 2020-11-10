import {
    Credential,
    GenerateECDSAKeypair,
    GenerateSeed,
    CreateRandomDID,
    DID,
    Schema,
    SchemaManager,
    ProofTypeManager,
    VerifiableCredential,
    VerifiablePresentation,
    VerifiableCredentialDataModel,
    VerifiablePresentationDataModel,
    SignDIDAuthentication,
    Presentation,
    DIDPublisher,
    DIDDocument,
    DecodeProofDocument,
} from '@iota/identity';
import { KEY_ID, IOTA_NODE_URL, MINIMUM_WEIGHT_MAGNITUDE, DEPTH, DEFAULT_TAG, DEVNET } from '~/lib/config';
import Keychain from '~/lib/keychain';
import { Schemas, SchemaNames, DIDMapping } from '~/lib/identity/schemas';
import { parse } from '~/lib/helpers';
import IotaIdentityLib from "iota-identity-wasm-test/web";


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
    [key in SchemaNames]: VerifiableCredentialDataModel;
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
        let IotaIdentity = <any>await IotaIdentityLib();
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

export const retrieveCredentials = (ids: string[]): Promise<VerifiableCredentialDataModel[]> => {
    return Promise.all(ids.map((id) => Keychain.get(id)))
        .then((data) => data.map((entry) => parse(entry.value)))
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
): Promise<string> => {
    return new Promise<string>(async (resolve, reject) => {
        console.log("Creating Credential: ", schemaName);
        //Initialize the Library - Is cached after first initialization
        let IotaIdentity = <any>await IotaIdentityLib();

        //Prepare credential Data
        let IssuerDidDoc = IotaIdentity.Doc.fromJSON(issuer.didDoc);
        console.log(IssuerDidDoc.toJSON());
        const credentialData = {
            id: IssuerDidDoc.id,
            name: "Subject",
            degree: {
                name: "Bachelor of Science and Arts",
                type: "BachelorDegree"
            }
        };
        console.log(credentialData);

        //Takes IssuerDoc, IssuerKey, CredentialSchemaURL, CredentialSchemaName, Data
        try {
        let vc = new IotaIdentity.VerifiableCredential( 
            IssuerDidDoc,
            IotaIdentity.Key.fromBase58(issuer.privateAuthKey, issuer.publicAuthKey),
            "http://useless.url/credentials/3732",
            schemaName,
            credentialData
        );
        console.log("Credential Created: ", schemaName);
        resolve(vc.toString());
        } catch(err) { console.log(err); reject(err); };
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
export const storeCredential = (credentialId: string, credential: VerifiableCredentialDataModel): Promise<{ value: boolean }> => {
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
export const retrieveCredential = (credentialId: string): Promise<VerifiableCredentialDataModel> => {
    return Keychain.get(credentialId)
        .then((data) => parse(data.value))
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
export const createVerifiablePresentations = (
    issuer: Identity,
    schemaNamesWithCredentials: SchemaNamesWithCredentials,
    challengeNonce: string
): Promise<VerifiablePresentationDataModel> => {
    return DIDDocument.readDIDDocument(IOTA_NODE_URL, issuer.root).then((issuerDID) => {
        const keypair = issuerDID.GetKeypair(issuer.keyId).GetEncryptionKeypair();

        // Set the private key, this enables the keypair to sign.
        keypair.SetPrivateKey(issuer.privateKey);

        SchemaManager.GetInstance().GetSchema('DIDAuthenticationCredential').AddTrustedDID(issuerDID.GetDID());

        const verifiableCredential = SignDIDAuthentication(issuerDID, issuer.keyId, challengeNonce);

        const restCredentials = Object.keys(schemaNamesWithCredentials).reduce(
            (acc: VerifiableCredential[], schemaName: SchemaNames) => {
                const credentials: VerifiableCredentialDataModel = schemaNamesWithCredentials[schemaName];

                const proofParameters = {
                    issuer: issuerDID,
                    issuerKeyId: new DID(credentials.proof.verificationMethod).GetFragment(),
                };

                SchemaManager.GetInstance().AddSchema(schemaName, Schemas[schemaName]);
                SchemaManager.GetInstance().GetSchema(schemaName).AddTrustedDID(issuerDID.GetDID());

                acc.push(VerifiableCredential.DecodeFromJSON(credentials, proofParameters));

                return acc;
            },
            [] as VerifiableCredential[]
        );

        // Create presentation
        const presentation = Presentation.Create([verifiableCredential, ...restCredentials]);
        const presentationProof = ProofTypeManager.GetInstance().CreateProofWithBuilder('EcdsaSecp256k1VerificationKey2019', {
            issuer: issuerDID,
            issuerKeyId: issuer.keyId,
            challengeNonce,
        });

        presentationProof.Sign(presentation.EncodeToJSON());

        const verifiablePresentation = VerifiablePresentation.Create(presentation, presentationProof);

        return verifiablePresentation.EncodeToJSON();
    });
};

export const registerSchemas = (schemas: SchemaNames[]): void => {
    schemas.map((schema) => {
        return SchemaManager.GetInstance().AddSchema(schema, Schemas[schema]);
    });
};

export const addTrustedDidToSchemas = (did: DID): void => {
    SchemaManager.GetInstance()
        .GetSchemaNames()
        .map((schema) => {
            return SchemaManager.GetInstance().GetSchema(schema).AddTrustedDID(did);
        });
};

export const removeTrustedDidFromSchemas = (did: DID): void => {
    SchemaManager.GetInstance()
        .GetSchemaNames()
        .map((schema) => {
            return SchemaManager.GetInstance().GetSchema(schema).RemoveTrustedDID(did);
        });
};

export const verifyChallange = (presentation: VerifiablePresentationDataModel): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        // TODO: reject if error
        const valid = parseInt(presentation.proof.nonce, 10) < Date.now() + 5 * 60 * 1000; // not older then 5 Minutes
        resolve(valid);
    });
};

export const verifyVerifiablePresentation = (presentation: VerifiablePresentationDataModel): Promise<boolean> => {
    const issuers = presentation.verifiableCredential.map((verifiableCredential) => verifiableCredential.proof);
    return Promise.all(issuers.map((issuer) => DecodeProofDocument(issuer, IOTA_NODE_URL))).then((resolvedIssuers) => {
        const issuersDIDs = resolvedIssuers.map((resolvedIssuer) => resolvedIssuer.issuer.GetDID());
        return DecodeProofDocument(presentation.proof, IOTA_NODE_URL).then((decodedProofDocument) => {
            return VerifiablePresentation.DecodeFromJSON(presentation, IOTA_NODE_URL, decodedProofDocument)
                .then((verifiablePresentation) => {
                    issuersDIDs.map((issuerDID) => addTrustedDidToSchemas(issuerDID));

                    return verifiablePresentation.Verify(IOTA_NODE_URL).then(() => {
                        return verifyChallange(presentation);
                    });
                })
                .finally(() => {
                    issuersDIDs.map((issuerDID) => removeTrustedDidFromSchemas(issuerDID));
                });
        });
    });
};

export type VerifiableCredentialEnrichment = {
    issuerLabel: string;
    logo: string;
    credentialLabel: string;
    theme: string;
};

export const enrichCredential = (credential: VerifiableCredentialDataModel): Promise<VerifiableCredentialEnrichment> => {
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

export const prepareCredentialForDisplay = (credential: VerifiableCredentialDataModel): VerifiableCredentialDataModel => {
    // TODO: deep copy
    const copy = { ...credential, credentialSubject: { ...credential.credentialSubject } };
    // TODO: typing
    if ((copy.credentialSubject as any).DID) {
        delete (copy.credentialSubject as any).DID;
    }
    return copy;
};
