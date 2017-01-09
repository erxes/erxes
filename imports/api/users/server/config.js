import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

Accounts.emailTemplates.siteName = (
  Meteor.settings.accounts && Meteor.settings.accounts.emailTemplates &&
  Meteor.settings.accounts.emailTemplates.siteName || 'Erxes'
);

Accounts.emailTemplates.from = (
  Meteor.settings.accounts && Meteor.settings.accounts.emailTemplates &&
  Meteor.settings.accounts.emailTemplates.from || 'no-reploy@erxes.org'
);

Accounts.urls.resetPassword = token => Meteor.absoluteUrl(`reset-password/${token}`);

Meteor.startup(() => {
  if (Meteor.users.find().count() > 0) {
    Accounts.config({
      forbidClientAccountCreation: true,
    });
  }
});
