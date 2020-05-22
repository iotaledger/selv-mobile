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
    DIDDocument
} from '@iota/identity';
import { KEY_ID, IOTA_NODE_URL, MINIMUM_WEIGHT_MAGNITUDE, DEPTH, DEFAULT_TAG } from '~/lib/config';
import Keychain from '~/lib/keychain';
import { Schemas, SchemaNames } from '~/lib/identity/schemas';
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
 * (User) address credential data
 */
export type AddressData = {
    Language: string;
    Locale: string;
    UserAddress: {
        City: string;
        State: string;
        Country: string;
        Postcode: string;
        Street: string;
        House: string;
    };
};

/**
 * (User) personal credential data
 */
export type PersonalData = {
    Language: string;
    Locale: string;
    UserPersonalData: {
        UserName: {
            FirstName: string;
            LastName: string;
        };
        UserDOB: {
            Date: string;
        };
        Birthplace: string;
        Nationality: string;
        Country: string;
        Gender: string;
        IdentityCardNumber: string;
        PassportNumber: string;
    };
};

/**
 * Test result credential data
 */
export type TestResultData = {
    TestID: string;
    TestBy: string;
    TestTimestamp: string;
    TestKit: string;
    TestResult: string;
};

/**
 * Visa application credential data
 */
export type VisaApplicationData = {
    VisaApplicationNumber: string;
    VisaCountry: string;
};

/**
 * (User) contact details
 */
export type ContactDetails = {
    Language: string;
    Locale: string;
    UserContacts: {
        Email: string;
        Phone: string;
        Cell: string;
    };
};

/**
 * Company credential data
 */
export type CompanyData = {
    CompanyName: string;
    CompanyAddress: string;
    CompanyType: string;
    CompanyBusiness: string;
    CompanyNumber: string;
    CompanyOwner: string;
    CompanyStatus: string;
    CompanyCreationDate: string;
};

/**
 * Bank credential data
 */
export type BankData = {
    BankName: string;
    AccountType: string;
    AccountNumber: string;
    AccountIBAN: string;
};

/**
 * Insurance credential data
 */
export type InsuranceData = {
    Name: string;
    Address: string;
    AccountNumber: string;
    InsuranceType: string;
    StartDate: string;
    EndDate: string;
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
 * @method storeIdentity
 *
 * @param {string} identifier
 * @param {Identity} identity
 *
 * @returns {Promise}
 */
export const retrieveIdentity = (identifier = 'did'): Promise<Identity> => {
    return Keychain.get(identifier)
        .then((data) => parse(data.value))
        .catch(() => null);
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
            ...data
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
            issuerKeyId: issuer.keyId
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

        SchemaManager.GetInstance()
            .GetSchema('DIDAuthenticationCredential')
            .AddTrustedDID(issuerDID.GetDID());

        const verifiableCredential = SignDIDAuthentication(issuerDID, issuer.keyId, challengeNonce);

        const restCredentials = Object.keys(schemaNamesWithCredentials).reduce(
            (acc: VerifiableCredential[], schemaName: SchemaNames) => {
                const credentials: VerifiableCredentialDataModel = schemaNamesWithCredentials[schemaName];

                const proofParameters = {
                    issuer: issuerDID,
                    issuerKeyId: new DID(credentials.proof.verificationMethod).GetFragment()
                };

                SchemaManager.GetInstance().AddSchema(schemaName, Schemas[schemaName]);
                SchemaManager.GetInstance()
                    .GetSchema(schemaName)
                    .AddTrustedDID(issuerDID.GetDID());

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
            challengeNonce
        });

        presentationProof.Sign(presentation.EncodeToJSON());

        const verifiablePresentation = VerifiablePresentation.Create(presentation, presentationProof);

        return verifiablePresentation.EncodeToJSON();
    });
};
