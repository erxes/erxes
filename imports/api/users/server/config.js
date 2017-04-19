import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

Accounts.emailTemplates.siteName = Meteor.settings.company.name;
Accounts.emailTemplates.from = Meteor.settings.company.noReplyEmail;

Accounts.urls.resetPassword = token => Meteor.absoluteUrl(`reset-password/${token}`);

Meteor.startup(() => {
  if (Meteor.users.find().count() > 0) {
    Accounts.config({
      forbidClientAccountCreation: true,
    });
  }
});
