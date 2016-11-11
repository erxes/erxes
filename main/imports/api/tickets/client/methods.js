import { Meteor } from 'meteor/meteor';


export function tagTicket(params, callback) {
  Meteor.call('tickets.tag', params, callback);
}
