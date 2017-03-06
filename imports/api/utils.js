import { Meteor } from 'meteor/meteor';
import { ROLES } from '/imports/api/users/constants';

const RESTRICTED_METHODS = [
  'users.invite', 'users.updateAccessInfo', 'users.remove',
  'brands.add', 'brands.edit', 'brands.remove', 'brands.configEmail',
  'channels.add', 'channels.edit', 'channels.remove',
  'forms.add', 'forms.edit', 'forms.remove',
  'integrations.add', 'integrations.edit', 'integrations.remove',
  'integrations.addInAppMessaging', 'integrations.addTwitter',
  'integrations.addFacebook',
];

// all validated methods mixin
// check login, permissions etc ..
// eslint-disable-next-line import/prefer-default-export
export function ErxesMixin(_options) {
  const options = _options;

  // save real run
  const runFunc = _options.run;

  // override run
  options.run = function run(...params) {
    // check login required
    if (!this.userId) {
      throw new Meteor.Error('loginRequired', 'Login required.');
    }

    if (Meteor.isServer) {
      const user = Meteor.users.findOne(this.userId);

      // check contributor permissions
      if (
        user.details && user.details.role === ROLES.CONTRIBUTOR &&
        RESTRICTED_METHODS.includes(_options.name)
      ) {
        throw new Meteor.Error('permissionDenied', 'Permission denied.');
      }
    }

    return runFunc.call(this, ...params);
  };

  return options;
}
