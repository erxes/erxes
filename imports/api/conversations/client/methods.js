import { Meteor } from 'meteor/meteor';


// eslint-disable-next-line import/prefer-default-export
export function tagConversation(params, callback) {
  Meteor.call('conversations.tag', params, callback);
}
