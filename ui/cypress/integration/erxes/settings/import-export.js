import "cypress-file-upload";
import { SignIn } from "../utils";

SignIn;

context("Import/Export", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("Import/Export", () => {
    cy.signIn();

    cy.get("#Settings").click();
    cy.get("#SettingsGeneralSettings")
      .children()
      .eq(3)
      .click();

    //file upload
    cy.fixture("customer.xlsx", "binary")
      .then(Cypress.Blob.binaryStringToBlob)
      .then((fileContent) => {
        cy.get("input[type=file]").attachFile({
          fileContent,
          fileName: "customer.xlsx",
          mimeType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          encoding: "utf8",
        });
      });

    cy.reload();

    cy.visit("/contacts/customer");
  });
});
