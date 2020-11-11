// / <reference types="cypress" />
import { SocketIO, Server } from 'mock-socket';
import { encrypt } from '../../ui/lib/helpers';

const fakeURL = 'http://internal.dev:8888';
const fakePassword = 'TpL4apWPbpRgfF4iEue8W4Fu11r60tRf';

const scannerDataHealthAuthority = {
    detail: `{"channelId":"4UAo6Em","challenge":"dfoFf1H1je","password":"${fakePassword}","shareWith":"healthAuthority","requestedCredentials":["PersonalData","Address"],"url":"${fakeURL}"}`
};
const scannerDataEmployer = {
    detail: `{"channelId":"tv2Io1i","challenge":"GyxjvVfUnd","password":"mblkHiLdU3DJsUOR7RcvV0MK1f6hi6dE","shareWith":"employer","requestedCredentials":["PersonalData", "Address", "TestResult"],"url":"${fakeURL}"}`
};
const scannerDataAgency = {
    detail: `{"channelId":"LfJfuGo","challenge":"hphl0pzPTi","password":"z38VOyesNr9QNBZW9X1CFIesjHk0woW7","shareWith":"agency","requestedCredentials":["PersonalData","Address","TestResult"],"url":"${fakeURL}"}`
};

const testResultData = {
    TestID: 'TestID Dummy Data',
    TestBy: 'TestBy Dummy Data',
    TestTimestamp: 'TestTimestamp Dummy Data',
    TestKit: 'TestKit Dummy Data',
    TestResult: 'TestResult Dummy Data'
};

const testResultCredential = {
    schemaName: 'TestResult',
    data: encrypt(fakePassword, JSON.stringify(testResultData)),
    url: fakeURL
};

const visaData = {
    VisaApplicationNumber: 'VisaApplicationNumber Dummy Data',
    VisaCountry: 'VisaCountry Dummy Data'
};

const visaCredential = {
    schemaName: 'VisaApplication',
    data: encrypt('z38VOyesNr9QNBZW9X1CFIesjHk0woW7', JSON.stringify(visaData)),
    url: fakeURL
};

context('Health Flow', () => {
    beforeEach(() => {
        cy.fixture('account').as('accountFixture');

        cy.get('@accountFixture').then((accountFixture) => {
            cy.window().then((win) => {
                Object.entries(accountFixture.localStorage).map((entry) => win.localStorage.setItem(entry[0], entry[1]));
            });
        });
        cy.visit('http://localhost:3001');
        const mockServer = new Server(fakeURL);
        mockServer.on('connection', (socket) => {
            // eslint-disable-next-line no-console
            console.debug('mock connection established');

            socket.on('verifiablePresentation', (message) => {
                // eslint-disable-next-line no-console
                console.debug('verifiablePresentation', JSON.stringify(message));
                setTimeout(() => {
                    if (message.channelId === '4UAo6Em') {
                        mockServer.emit('createCredential', JSON.stringify(testResultCredential));
                    }
                    if (message.channelId === 'LfJfuGo') {
                        // eslint-disable-next-line no-console
                        console.debug('Agency');
                        mockServer.emit('createCredential', JSON.stringify(visaCredential));
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

    it('flow', () => {
        cy.contains('Scan Code').click();
        cy.window().then((win) => {
            win.handleScannerData(scannerDataHealthAuthority);
        });

        cy.contains('Share credential').click();

        // TODO: assert response

        cy.contains('Accept certificate?', { timeout: 10000 });
        cy.contains('Health Certificate');
        cy.get('button:contains("Accept certificate")').click();
        cy.get('.list:contains("Health Certificate")').click();
        cy.get('*')
            .children()
            .should('contain', testResultData.TestID)
            .and('contain', testResultData.TestBy)
            .and('contain', testResultData.TestTimestamp)
            .and('contain', testResultData.TestKit)
            .and('contain', testResultData.TestResult);
        cy.get('img[src="chevron-left.svg"]').click();

        cy.contains('Scan Code').click();
        cy.window().then((win) => {
            win.handleScannerData(scannerDataEmployer);
        });
        cy.contains('Share credential').click();

        // TODO: assert response

        cy.get('.list:contains("My Identity")');

        cy.contains('Scan Code').click();
        cy.window().then((win) => {
            win.handleScannerData(scannerDataAgency);
        });
        cy.contains('Share credential').click();
        cy.contains('Accept certificate?', { timeout: 10000 });
        cy.contains('Travel Visa');
        cy.get('button:contains("Accept certificate")').click();
        cy.get('.list:contains("Travel Visa")').click();
        cy.get('*')
            .children()
            .should('contain', visaData.VisaApplicationNumber)
            .and('contain', visaData.VisaCountry);
        cy.get('img[src="chevron-left.svg"]').click();
    });

    afterEach(() => {
        cy.get('@mockServer').then((mockServer) => mockServer.stop());
    });
});
