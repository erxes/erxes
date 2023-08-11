/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
Cypress.Commands.add('login', (email, password) => {
    cy.get('input[name=email]').type(`${email}`);
    cy.get('input[name=password]').type(`${password}`); 
    cy.get('button.sc-bRBYWo').click();
    cy.url().should('include', '/dashboard');
    cy.getCookie('auth-token').should('exist');
})

Cypress.Commands.add('fakeNameCustomer', () => {
    let result = ''
    const names = ["amrjrgl88","amr.77","amra_456","amar123","jargl01","jaagii05","james_king","amarjargal_boss","batbayar_nice77","bat_firet123","bayar123","bayarbat123"]
    result += names[Math.floor(Math.random() * names.length)];
    return result;
})
Cypress.Commands.add('fakeName', (length) => {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  });
Cypress.Commands.add('isExistElement', selector => {
    cy.get('body').then(($el) => {
      if ($el.has(selector)) {
        return true
      } else {
        return false
      }
    })
  });
Cypress.Commands.add('waitElm' , (selector) => {
    cy.get(selector).should("be.visible");
});
  
Cypress.Commands.add('waitTilDisappear' , (selector) => {
    cy.get(selector).should("not.be.visible");
  });
  
Cypress.Commands.add('waitAndClick', (selector) => {
    cy.get(selector).should("be.visible");
    cy.get(selector).click({ force: true });
  });
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }