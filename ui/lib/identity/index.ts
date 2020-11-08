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
import { KEY_ID, IOTA_NODE_URL, MINIMUM_WEIGHT_MAGNITUDE, DEPTH, DEFAULT_TAG } from '~/lib/config';
import Keychain from '~/lib/keychain';
import { Schemas, SchemaNames, DIDMapping } from '~/lib/identity/schemas';
import { parse } from '~/lib/helpers';

/**
 * Personal identity object
 */
export type Identity = {
    seed: string;
    root: string;
    keyId: string;
    privateKey: string;
    mamState: any;
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
 * @method createCredential
 *
 * @param {Identity} issuer
 * @param {SchemaNames} schemaName
 * @param {any} data
 * @param {string} revocationAddress
 *
 * @returns {Promise<VerifiableCredentialDataModel>}
 */
export const createCredential = (
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
