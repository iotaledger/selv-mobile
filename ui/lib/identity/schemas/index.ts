// TODO: check rule
// eslint-disable-next-line no-shadow
export enum SchemaNames {
    ADDRESS = 'Address',
    PERSONAL_DATA = 'PersonalData',
    TEST_RESULT = 'TestResult',
    VISA_APPLICATION = 'VisaApplication',
    BANK_ACCOUNT = 'BankAccount',
    COMPANY = 'Company',
    CONTACT_DETAILS = 'ContactDetails',
    INSURANCE = 'Insurance',
}

export const AddressSchema = {
    type: 'object',
    required: ['DID'],
    properties: {
        DID: {
            type: 'string',
        },
        Language: {
            type: 'string',
        },
        Locale: {
            type: 'string',
        },
        UserAddress: {
            type: 'object',
            properties: {
                City: {
                    type: 'string',
                },
                State: {
                    type: 'string',
                },
                Country: {
                    type: 'string',
                },
                Postcode: {
                    type: 'string',
                },
                Street: {
                    type: 'string',
                },
                AdditionalAddress: {
                    type: 'string',
                },
                House: {
                    type: 'string',
                },
            },
        },
    },
};

export const PersonalDataSchema = {
    type: 'object',
    required: ['DID'],
    properties: {
        DID: {
            type: 'string',
        },
        Language: {
            type: 'string',
        },
        Locale: {
            type: 'string',
        },
        TimezoneOffset: {
            type: 'string',
        },
        UserPersonalData: {
            type: 'object',
            properties: {
                UserName: {
                    type: 'object',
                    properties: {
                        Title: {
                            type: 'string',
                        },
                        FirstName: {
                            type: 'string',
                        },
                        LastName: {
                            type: 'string',
                        },
                    },
                },
                UserDOB: {
                    type: 'object',
                    properties: {
                        Date: {
                            type: 'string',
                        },
                        Age: {
                            type: 'number',
                        },
                    },
                },
                Birthplace: {
                    type: 'string',
                },
                Nationality: {
                    type: 'string',
                },
                Gender: {
                    type: 'string',
                },
                IdentityCardNumber: {
                    type: 'string',
                },
                PassportNumber: {
                    type: 'string',
                },
            },
        },
    },
};

export const TestResultSchema = {
    type: 'object',
    required: [] as string[],
    properties: {
        TestID: {
            type: 'string',
        },
        TestBy: {
            type: 'string',
        },
        TestTimestamp: {
            type: 'string',
        },
        TestKit: {
            type: 'string',
        },
        TestResult: {
            type: 'string',
        },
    },
};

export const VisaApplicationSchema = {
    type: 'object',
    required: [] as string[],
    properties: {
        VisaApplicationNumber: {
            type: 'string',
        },
        VisaCountry: {
            type: 'string',
        },
    },
};

export const BankAccountSchema = {
    type: 'object',
    required: ['DID'],
    properties: {
        DID: {
            type: 'string',
        },
        Language: {
            type: 'string',
        },
        Locale: {
            type: 'string',
        },
        Bank: {
            type: 'object',
            properties: {
                AccountType: {
                    type: 'string',
                },
                AccountNumber: {
                    type: 'string',
                },
                AccountIBAN: {
                    type: 'string',
                },
                BankName: {
                    type: 'string',
                },
            },
        },
    },
};

export const CompanySchema = {
    type: 'object',
    required: ['DID'],
    properties: {
        DID: {
            type: 'string',
        },
        Language: {
            type: 'string',
        },
        Locale: {
            type: 'string',
        },
        Company: {
            type: 'object',
            properties: {
                CompanyName: {
                    type: 'string',
                },
                CompanyAddress: {
                    type: 'string',
                },
                CompanyType: {
                    type: 'string',
                },
                CompanyOwner: {
                    type: 'string',
                },
                CompanyCapital: {
                    type: 'number',
                },
                CompanyBusiness: {
                    type: 'string',
                },
                CompanyCreationDate: {
                    type: 'string',
                },
                CompanyStatus: {
                    type: 'string',
                },
                CompanyNumber: {
                    type: 'number',
                },
                CompanyOwners: {
                    type: 'array',
                    CompanyOwner: {
                        type: 'string',
                    },
                },
            },
        },
    },
};

export const ContactDetailsSchema = {
    type: 'object',
    required: ['DID'],
    properties: {
        DID: {
            type: 'string',
        },
        Language: {
            type: 'string',
        },
        Locale: {
            type: 'string',
        },
        TimezoneOffset: {
            type: 'string',
        },
        UserContacts: {
            type: 'object',
            properties: {
                Email: {
                    type: 'string',
                },
                Phone: {
                    type: 'string',
                },
                Cell: {
                    type: 'string',
                },
            },
        },
    },
};

export const InsuranceSchema = {
    type: 'object',
    required: ['DID'],
    properties: {
        DID: {
            type: 'string',
        },
        Language: {
            type: 'string',
        },
        Locale: {
            type: 'string',
        },
        TimezoneOffset: {
            type: 'string',
        },
        Insurance: {
            type: 'object',
            properties: {
                Name: {
                    type: 'string',
                },
                Address: {
                    type: 'string',
                },
                AccountNumber: {
                    type: 'string',
                },
                InsuranceType: {
                    type: 'string',
                },
                StartDate: {
                    type: 'string',
                },
                EndDate: {
                    type: 'string',
                },
            },
        },
    },
};

export const Schemas = {
    [SchemaNames.ADDRESS]: AddressSchema,
    [SchemaNames.PERSONAL_DATA]: PersonalDataSchema,
    [SchemaNames.TEST_RESULT]: TestResultSchema,
    [SchemaNames.VISA_APPLICATION]: VisaApplicationSchema,
    [SchemaNames.BANK_ACCOUNT]: BankAccountSchema,
    [SchemaNames.COMPANY]: CompanySchema,
    [SchemaNames.CONTACT_DETAILS]: ContactDetailsSchema,
    [SchemaNames.INSURANCE]: InsuranceSchema,
};

export const DIDMapping: { [DID: string]: { logo: string; issuerLabel: string; theme: string } } = {
    'did:IOTA:CQMOHTVOCNYQHTSUBSDPNLRBYTBBAHRTOQZZCN9DUWXCVGAYOYGFBEQJOCFXPSCKPPNAZPKALAVYMZICF': {
        issuerLabel: 'Government',
        logo: 'government',
        theme: '#00ffaa',
    },
};
