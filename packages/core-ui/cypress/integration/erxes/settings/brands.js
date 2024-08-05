import "cypress-file-upload";
import { SignIn, waitTilDisappear } from "../utils";

SignIn;

context("Brands", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("Brands", () => {
    cy.signIn();
    cy.visit("/settings/brands");

    cy.get("#NewBrandButton").click();
    cy.get("input[name=name]").type("new test brand");
    cy.get("textarea[name=description]").type("new test brand description");
    cy.get("input[type=email]").type("test@test.com");
    cy.get("select").select("Custom");
    cy.get('[style="min-height: 120px; max-height: 0px;"]').within(() => {
      cy.get("div.tiptap.ProseMirror")
        .focus()
        .type("{selectall}{backspace}Custom template");
    });
    cy.get("button[type=submit]").click();

    waitTilDisappear("textarea[name=description]");

    cy.get("tbody").within(() => {
      cy.contains("new test brand")
        .parent("tr")
        .children()
        .eq(2)
        .children()
        .eq(0)
        .children()
        .eq(0)
        .children()
        .eq(0)
        .click();
    });
    cy.get("input[name=name]").click().type(" edited");
    cy.get("button[type=submit]").click();

    waitTilDisappear("textarea[name=description]");

    cy.get("tbody").within(() => {
      cy.contains("new test brand edited")
        .parent("tr")
        .within(() => {
          cy.get("button[icon='cancel-1']").click();
        });
    });
    cy.get("input[type=text]").type("delete");
    cy.get("button[icon='check-circle']").click();
  });
});
