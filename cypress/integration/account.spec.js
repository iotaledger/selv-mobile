// / <reference types="cypress" />
const click = ($el) => $el.click();

context('Setup Account', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3001');
    });

    it('flow', () => {
        cy.contains('Next').click();
        cy.contains('Next').click();
        cy.contains('Continue').click();
        cy.get('[placeholder="First name"]').type('Testing');
        cy.contains('Save Name')
            .pipe(click, { timeout: 60000 })
            .should('not.exist', { timeout: 10000 });

        cy.get('.list:contains("My Identity")').click();
        cy.contains('first Name')
            .siblings()
            .should('not.be.empty');
        cy.contains('last Name')
            .siblings()
            .should('not.be.empty');
        cy.contains('date Of Birth')
            .siblings()
            .should('not.be.empty');
        cy.contains('birth Place')
            .siblings()
            .should('not.be.empty');
        cy.contains('nationality')
            .siblings()
            .should('not.be.empty');
        cy.contains('country Of Residence')
            .siblings()
            .should('not.be.empty');
        cy.contains('address')
            .siblings()
            .should('not.be.empty');
        cy.contains('identity Card Number')
            .siblings()
            .should('not.be.empty');
        cy.contains('passport Number')
            .siblings()
            .should('not.be.empty');
        cy.contains('phone Number')
            .siblings()
            .should('not.be.empty');
        cy.contains('email')
            .siblings()
            .should('not.be.empty');
        cy.get('img[src="chevron-left.svg"]').click();
    });
});
