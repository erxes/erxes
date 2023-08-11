describe("Contacts", () => {

  it("add & set tag & remove company", () => {
    Cypress.Cookies.debug(true);
      cy.visit('/');
      cy.clearCookies();
      cy.on('uncaught:exception', (err, runnable) => {
          return false
    })
    
    cy.login(Cypress.env('userEmail'), Cypress.env('userPassword'))
    .visit("/companies");

    const random = Math.random().toString(36).slice(2)

    //add company
    cy.get('i[icon = "plus-circle"]').click();

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

    //add tag
    cy.get("#companiesCheckBox").click();

    cy.get('button[icon="tag-alt"]').click();

    cy.get('i[class="icon-tag-alt"]')
    .eq(0)
    .parent()
    .parent()
    .click();

    cy.get('button[icon="tag-alt"]').click();


    //delete company
    cy.contains(random)
    .parent()
    .parent()
    .parent()
    .parent()
    .children('td[id="companiesCheckBox"]')
    .children('label')
    .click()

    cy.get('button[icon="cancel-1"]')
    .click();

    if(cy.get('div[class="modal-content"]')){
      cy.get('button[icon="check-circle"]').click()
    }
  });
});
