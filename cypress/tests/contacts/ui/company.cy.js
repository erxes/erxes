describe("Contacts", () => {
  beforeEach(() => {
    cy.exec('yarn run cypress:seedDB').wait(300);
    Cypress.Cookies.debug(true);
    cy.visit('/');
    cy.clearCookies();
    cy.on('uncaught:exception', (err, runnable) => {
        return false
    })
    
    cy.login(Cypress.env('userEmail'), Cypress.env('userPassword'))
    .visit("/companies").wait(300);
  })
  const random = Math.random().toString(36).slice(2)

  it("add company", () => {

    cy.get('i[icon = "plus-circle"]', { timeout: 300000 }).click();

    cy.get("div .Select-placeholder")
      .contains("Enter company name")
      .click()
      .type(`${random}{enter}`)

    cy.get("div .Select-placeholder")
      .contains("Enter company email")
      .click()
      .type(`${random}@nmma.co{enter}`);

    cy.get('button[type="submit"]')
      .click();
  })

  it("set tag company", () => {

    cy.get("#companiesCheckBox",{ timeout: 300000 }).eq(0).click();

    cy.get('button[icon="tag-alt"]').click();

    cy.get('i[class="icon-tag-alt"]')
    .eq(0)
    .parent()
    .parent()
    .click();

    cy.get('button[icon="tag-alt"]').click();
  })

  it("remove company", () => {

    cy.contains(random, { timeout: 300000 })
    .parent()
    .parent()
    .parent()
    .parent()
    .children('td[id="companiesCheckBox"]')
    .children('label')
    .click()

    cy.get('button[icon="cancel-1"]')
    .click();

    cy.get('button[icon="check-circle"]').click()
  });
});
