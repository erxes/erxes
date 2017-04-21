import { Meteor } from 'meteor/meteor';

export function tagConversation(params, callback) {
  Meteor.call('conversations.tag', params, callback);
}
