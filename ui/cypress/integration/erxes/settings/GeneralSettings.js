import { SignIn, fakeNameCustomer } from '../utils';

SignIn;

context('Settings', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Settings', () => {
    cy.signIn();

    cy.get('#Settings').click();
    cy.url().should('include', '/settings');

    // General Settings Main
    cy.get('#SettingsGeneralSettings').children().eq(0).click();

    //General System config
    cy.get('#SettingsSidebar').children().eq(0).click();
    cy.get('#GeneralSettingsMenu').children().eq(0).click()
    cy.get('div.Select-value:first').click().get('.Select-option:contains(Italian)').click();
    cy.get('#react-select-3--value').click().get('.Select-option:contains(a)').eq(0).click()
    cy.get('#react-select-4--value').click();
    cy.get('#GeneralSettingsMenu').children().eq(0).children().eq(0).click()

    //File upload
    cy.get('#GeneralSettingsMenu').children().eq(1).click()
    cy.get('#react-select-5--value').click().get('.Select-option:contains(.)').eq(0).click()
    cy.get('#react-select-6--value').click().get('.Select-option:contains(.)').eq(0).click()
    cy.get('#react-select-7--value').click().get('.Select-option:contains(Google)').click()
    cy.get('#react-select-8--value > .Select-value').click().get('.Select-option:contains(Private)').click();
    cy.get('#GeneralSettingsMenu').children().eq(1).children().eq(0).click()

    //Google Cloud Storage
    const blah = cy.get('#GeneralSettingsMenu').children().eq(2).click();
    blah.find('input').type('amra');
    cy.get('#GeneralSettingsMenu').children().eq(2).children().eq(0).click()


    //AWS S3
    const awss3 =  cy.get('#GeneralSettingsMenu').children().eq(3).click();
    awss3.within(() => {
      for( let i=0; i<=5; i++){
        cy.get('input').eq(i).type('ssss' + i)
      }
    })
    cy.get('#GeneralSettingsMenu').children().eq(3).children().eq(0).click();

    //AWSSES
    const awsses = cy.get('#GeneralSettingsMenu').children().eq(4).click();
    awsses.within(() => {
      for( let i=0; i<=3; i++){
        cy.get('input').eq(i).type('ssss' + i)
      }
    })
    cy.get('#GeneralSettingsMenu').children().eq(4).children().eq(0).click();

    //Google
    const google = cy.get('#GeneralSettingsMenu').children().eq(5).click();
    google.within(() => {
      for( let i=0; i<=4; i++){
        if(i != 1){
          cy.get('input').eq(i).type('ssss' + i)
        }
      }
    })
    cy.get('#GeneralSettingsMenu').children().eq(5).children().eq(0).click();

    //Common mail config
    const mailconfig = cy.get('#GeneralSettingsMenu').children().eq(6).click();
    mailconfig.within(() => {
      for( let i=0; i<1; i++){
        cy.get('input').eq(i).type('ssss' + i)
      }
    })
    cy.get('#GeneralSettingsMenu').children().eq(6).children().eq(0).click();

    //Custom mail service
    const mailservice = cy.get('#GeneralSettingsMenu').children().eq(7).click();
    mailservice.within(() => {
      for( let i=0; i<=4; i++){
        if(i != 1){
          cy.get('input').eq(i).type('ssss' + i)
        }
      }
    })
    cy.get('#GeneralSettingsMenu').children().eq(7).children().eq(0).click();

    cy.get('button[id=generalSettingsSave]').click()

    //Integrations config
    cy.get('#SettingsSidebar').children().eq(1).click()
    // facebook
    const facebook = cy.get('#IntegrationSettingsMenu').children().eq(0).click();
    facebook.within(() => {
      for( let i=0; i<=3; i++){
        if(i != 3){
          cy.get('input').eq(i).type('ssss' + i)
        }
      }
    })
    cy.get('#IntegrationSettingsMenu').children().eq(0).children().eq(0).click();

    //twitter
    const twitter = cy.get('#IntegrationSettingsMenu').children().eq(1).click();
    twitter.within(() => {
      for( let i=0; i<=4; i++){
        cy.get('input').eq(i).type('ssss' + i)
      }
    })
    cy.get('#IntegrationSettingsMenu').children().eq(1).children().eq(0).click();

    //nylas
    const nylas = cy.get('#IntegrationSettingsMenu').children().eq(2).click();
    nylas.within(() => {
      for( let i=0; i<=4; i++){
        cy.get('input').eq(i).type('ssss' + i)
      }
    })
    cy.get('#IntegrationSettingsMenu').children().eq(2).children().eq(0).click();

    //video call
    const videocall = cy.get('#IntegrationSettingsMenu').children().eq(3).click();
    videocall.within(() => {
      for( let i=0; i<=1; i++){
        cy.get('input').eq(i).type('ssss' + i)
      }
      cy.get('select[name=VIDEO_CALL_TYPE]').select('Daily')
    })
    cy.get('#IntegrationSettingsMenu').children().eq(3).children().eq(0).click();

    //conversation api
    const conversationapi = cy.get('#IntegrationSettingsMenu').children().eq(4).click();
    conversationapi.within(() => {
      for( let i=0; i<=3; i++){
        cy.get('input').eq(i).type('ssss' + i)
      }
    })
    cy.get('#IntegrationSettingsMenu').children().eq(5).children().eq(0).click();

    //chat api
    const gmail = cy.get('#IntegrationSettingsMenu').children().eq(5).click();
    gmail.within(() => {
      for( let i=0; i<=1; i++){
        cy.get('input').eq(i).type('ssss' + i)
      }
    })
    cy.get('#IntegrationSettingsMenu').children().eq(6).children().eq(0).click();

    cy.get('button[icon=check-circle]').click()

    // Engage config
    cy.get('#SettingsSidebar').children().eq(2).click()

    //general settings
    let gensettings = cy.get('#EngageSettingsMenu').children().eq(0).click()

    gensettings.within(() => {
      for( let i=0; i<=4; i++){
        if(i != 4){
          cy.get('input').eq(i).type('ssss' + i)
        }
        cy.get('button[icon=check-circle]').click()
      }
    })
    cy.get('#EngageSettingsMenu').children().eq(0).children().eq(0).click();

    //verify the email address that you send mail from
    const verifyEmail = cy.get('#EngageSettingsMenu').children().eq(1).click()

    verifyEmail.within(() => {
      for( let i=0; i<=0; i++){
        cy.get('input').eq(i).type('ssss' + i)
        const random = fakeNameCustomer();
        cy.get('input[type=email]').type(random + "@nmma.co");
      }
    })
    cy.get('#EngageSettingsMenu').children().eq(1).children().eq(0).click();


    //send your first testing email

    gensettings = cy.get('#EngageSettingsMenu').children().eq(2).click();

    gensettings.within(() => {
      for( let i=0; i<=2; i++){
        if(i != 2){
          const random = fakeNameCustomer();
          cy.get('input').eq(i).type(random + "@nmma.co")
        } else {
          cy.get('textarea').type('I LOVE YOU')
        }
      }
      cy.get('button[icon=message]').click()
    })
    cy.get('#EngageSettingsMenu').children().eq(2).children().eq(0).click();

    cy.get('#Settings').click();
  });
});
