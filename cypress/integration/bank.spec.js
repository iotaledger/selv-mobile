// / <reference types="cypress" />
import { SocketIO, Server } from 'mock-socket';
import { encrypt } from '../../ui/lib/helpers';

const fakeURL = 'http://internal.dev:8888';
const fakePassword = 'TpL4apWPbpRgfF4iEue8W4Fu11r60tRf';

const scannerCompany = {
    detail: `{"channelId":"UWNd14u","challenge":"jofzk2syMF","password":"${fakePassword}","requestedCredentials":["Address","PersonalData","ContactDetails"],"shareWith":"company","url":"${fakeURL}"}`
};
const scannerBank = {
    detail: `{"channelId":"escaEww","challenge":"cyZChxcW4R","password":"${fakePassword}","requestedCredentials":["Address","PersonalData","ContactDetails","Company"],"shareWith":"bank","url":"${fakeURL}"}`
};
const scannerInsurance = {
    detail: `{"channelId":"qkTLSIC","challenge":"J8K6qDEcjW","password":"${fakePassword}","requestedCredentials":["Address","PersonalData","ContactDetails","Company","BankAccount"],"shareWith":"insurance","url":"${fakeURL}"}`
};

context('Bank Flow', () => {
    beforeEach(() => {
        cy.fixture('bank').as('bankFixture');
        cy.fixture('account').as('accountFixture');

        cy.get('@accountFixture').then((accountFixture) => {
            cy.window().then((win) => {
                Object.entries(accountFixture.localStorage).map((entry) => win.localStorage.setItem(entry[0], entry[1]));
            });
        });

        cy.visit('http://localhost:3001');

        cy.get('@bankFixture').then((bankFixture) => {
            const mockServer = new Server(fakeURL);
            mockServer.on('connection', (socket) => {
                // eslint-disable-next-line no-console
                console.debug('mock connection established');

                socket.on('verifiablePresentation', (message) => {
                    // eslint-disable-next-line no-console
                    console.debug('verifiablePresentation', JSON.stringify(message));
                    setTimeout(() => {
                        if (message.channelId === 'UWNd14u') {
                            mockServer.emit(
                                'createCredential',
                                JSON.stringify({
                                    schemaName: 'Company',
                                    data: encrypt(fakePassword, JSON.stringify(bankFixture.companyData)),
                                    url: fakeURL
                                })
                            );
                        }
                        if (message.channelId === 'escaEww') {
                            mockServer.emit(
                                'createCredential',
                                JSON.stringify({
                                    schemaName: 'BankAccount',
                                    data: encrypt(fakePassword, JSON.stringify(bankFixture.bankData)),
                                    url: fakeURL
                                })
                            );
                        }
                        if (message.channelId === 'qkTLSIC') {
                            mockServer.emit(
                                'createCredential',
                                JSON.stringify({
                                    schemaName: 'Insurance',
                                    data: encrypt(fakePassword, JSON.stringify(bankFixture.insuranceData)),
                                    url: fakeURL
                                })
                            );
                        }
                    }, 1000);
                });

                socket.on('createCredential', (message) => {
                    // eslint-disable-next-line no-console
                    console.debug('createCredential', JSON.stringify(message));
                });

                socket.on('error', (error) => {
                    console.error(error);
                });
            });

            cy.wrap(mockServer).as('mockServer');
            cy.window().then((win) => {
                // eslint-disable-next-line no-param-reassign
                win.io = SocketIO;
            });
        });
    });

    it('flow', () => {
        cy.contains('Scan Code').click();
        cy.window().then((win) => {
            win.handleScannerData(scannerCompany);
        });
        cy.contains('Share credential').click();

        cy.get('.list:contains("My Identity")');

        cy.contains('Accept certificate?', { timeout: 10000 });
        cy.contains('Business Details');
        cy.get('button:contains("Accept certificate")').click();

        cy.get('.list:contains("Business Details")', { timeout: 10000 }).click();

        cy.get('@bankFixture').then((bankFixture) => {
            bankFixture.companyDataFieldsToTest.map((field) => cy.contains(bankFixture.companyData[field]));
        });

        cy.get('img[src="chevron-left.svg"]').click();

        cy.window().then((win) => {
            win.handleScannerData(scannerBank);
        });
        cy.contains('Share credential').click();

        cy.contains('Accept certificate?', { timeout: 10000 });
        cy.contains('Bank Details');
        cy.get('button:contains("Accept certificate")').click();

        // TODO: check document

        cy.window().then((win) => {
            win.handleScannerData(scannerInsurance);
        });
        cy.contains('Share credential').click();

        cy.contains('Accept certificate?', { timeout: 10000 });
        cy.contains('Liability Insurance');
        cy.get('button:contains("Accept certificate")').click();

        // TODO: check document
    });

    afterEach(() => {
        cy.get('@mockServer').then((mockServer) => mockServer.stop());
    });
});
