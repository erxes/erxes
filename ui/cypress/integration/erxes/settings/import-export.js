import 'cypress-file-upload';
import { SignIn, waitAndClick } from "../utils";

SignIn;

context('Import/Export', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Import/Export', () => {
    cy.signIn();

    // Import & Export
    cy.get('#Settings').click();
    cy.get('#SettingsGeneralSettings').children().eq(6).click();

    const hasDownloadsIndexs = [2, 3, 4, 6];

    for(let i=0; i<11; i++){
      cy.get('#ImportExportSidebar').children().eq(i).click()

      if (hasDownloadsIndexs.includes(i)) {
        waitAndClick('i[icon=folder-download]');

        cy.get('button').contains('Cancel').click();
      }
    }

    cy.get('#navigation').children().eq(3).click()
    cy.get('a[href="/contacts/customer"]').click()

    cy.get('#Settings').click()
    cy.get('#SettingsGeneralSettings').children().eq(6).click();

    //file upload
    cy.fixture('customer.xlsx', 'binary')
      .then(Cypress.Blob.binaryStringToBlob)
      .then(fileContent => {
        cy.get('input[type=file]').attachFile({
          fileContent,
          fileName: 'customer.xlsx',
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          encoding: 'utf8'
        })
    })

    cy.reload();
    cy.get('#navigation').children().eq(3).click()
    cy.get('a[href="/contacts/customer"]').click()
  });
});
