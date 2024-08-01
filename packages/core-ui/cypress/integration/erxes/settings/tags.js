import "cypress-file-upload";

import { SignIn, waitTilDisappear } from "../utils";

SignIn;

Cypress.Commands.add('addTag', (name, color) => {
  cy.get("#AddTagButton").click();
  cy.get("input[name=name]").type(name);
  cy.get("label")
    .contains("Color")
    .parent()
    .children()
    .eq(1)
    .children()
    .eq(0)
    .click();
  cy.get('[style="position: relative;"] > input').clear().type(color);
  cy.get("label").contains("Color").parent().children().eq(1).click();
  cy.get("#AddTagButtons").children().eq(1).click();

  waitTilDisappear('div[class="modal-dialog"]');
});

context("Tags", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.signIn();
    cy.visit("/settings/tags");
  });

  it("Add test tags", () => {
    cy.addTag("name", "#000000")
    cy.addTag("name2", "#EECCEE")
    cy.addTag("name3", "#b4a8e3")
  });

  it("Check tag actions", () => {
    cy.get("#TagsSidebar").children().eq(0).children().click();

    cy.contains("span", "name2")
      .closest("td")
      .parent("tr")
      .children()
      .eq(4)
      .children()
      .eq(0)
      .children()
      .eq(0)
      .click();

    cy.get("input[name=name]").clear().type("moved test tag");
    cy.get("label")
      .contains("Color")
      .parent()
      .children()
      .eq(1)
      .children()
      .eq(0)
      .click();
    cy.get('[style="padding: 15px 9px 9px 15px;"]')
      .children("span")
      .eq(8)
      .children()
      .click();
    cy.get("label").contains("Color").click();
    cy.get("select[name=type]").select("Customer");
    cy.get("#AddTagButtons").children().eq(1).click();

    cy.contains("span", "name3")
      .closest("td")
      .parent("tr")
      .should("be.visible")
      .within(() => {
        cy.get("button[icon='merge']").click();
      });

    cy.get('div[class=" css-13cymwt-control"]').click();
    cy.get('div[class=" css-1nmdiq5-menu"]').contains("name").click();
    cy.contains("button", "Merge").click();

    cy.contains("span", "name")
      .closest("td")
      .parent("tr")
      .should("be.visible")
      .within(() => {
        cy.get("button[icon='times-circle']").click();
      });
    cy.contains("span", "Yes, I am").click();

    cy.get('input[placeholder="Type to search"]').type("mlml");
    cy.get("table tbody tr").each(($row) => {
      cy.wrap($row).within(() => {
        cy.get("td")
          .eq(0)
          .then(($td) => {
            const tagName = $td.text().trim().toLowerCase();
            expect(tagName).to.contain("mlml");
          });
      });
    });
    cy.get("table tbody tr").should("have.length", 2);
  });
});
