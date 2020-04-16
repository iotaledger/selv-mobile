export enum SchemaNames {
    ADDRESS = 'Address',
    PERSONAL_DATA = 'PersonalData',
    TEST_RESULT = 'TestResult',
    VISA_APPLICATION = 'VisaApplication'
}

export const AddressSchema = {
    type: 'object',
    required: ['did'],
    properties: {
        DID: {
            type: 'string'
        },
        Language: {
            type: 'string'
        },
        Locale: {
            type: 'string'
        },
        UserAddress: {
            type: 'object',
            properties: {
                City: {
                    type: 'string'
                },
                State: {
                    type: 'string'
                },
                Country: {
                    type: 'string'
                },
                Postcode: {
                    type: 'string'
                },
                Street: {
                    type: 'string'
                },
                AdditionalAddress: {
                    type: 'string'
                },
                House: {
                    type: 'string'
                }
            }
        }
    }
};

export const PersonalDataSchema = {
    type: 'object',
    required: ['DID'],
    properties: {
        DID: {
            type: 'string'
        },
        Language: {
            type: 'string'
        },
        Locale: {
            type: 'string'
        },
        TimezoneOffset: {
            type: 'string'
        },
        UserPersonalData: {
            type: 'object',
            properties: {
                UserName: {
                    type: 'object',
                    properties: {
                        Title: {
                            type: 'string'
                        },
                        FirstName: {
                            type: 'string'
                        },
                        LastName: {
                            type: 'string'
                        }
                    }
                },
                UserDOB: {
                    type: 'object',
                    properties: {
                        Date: {
                            type: 'string'
                        },
                        Age: {
                            type: 'number'
                        }
                    }
                },
                Birthplace: {
                    type: 'string'
                },
                Nationality: {
                    type: 'string'
                },
                Gender: {
                    type: 'string'
                },
                IdentityCardNumber: {
                    type: 'string'
                },
                PassportNumber: {
                    type: 'string'
                }
            }
        }
    }
};

export const TestResultSchema = {
    type: 'object',
    required: [] as string[],
    properties: {
        TestID: {
            type: 'string'
        },
        TestBy: {
            type: 'string'
        },
        TestTimestamp: {
            type: 'string'
        },
        TestKit: {
            type: 'string'
        },
        TestResult: {
            type: 'string'
        }
    }
};

export const VisaApplicationSchema = {
    type: 'object',
    required: [] as string[],
    properties: {
        VisaApplicationNumber: {
            type: 'string'
        },
        VisaCountry: {
            type: 'string'
        }
    }
};

export const Schemas = {
    [SchemaNames.ADDRESS]: AddressSchema,
    [SchemaNames.PERSONAL_DATA]: PersonalDataSchema,
    [SchemaNames.TEST_RESULT]: TestResultSchema,
    [SchemaNames.VISA_APPLICATION]: VisaApplicationSchema
};
