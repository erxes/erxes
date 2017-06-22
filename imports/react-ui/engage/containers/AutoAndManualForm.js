import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import Alert from 'meteor/erxes-notifier';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { EmailTemplates } from '/imports/api/emailTemplates/emailTemplates';
import Segments from '/imports/api/customers/segments';
import { Messages } from '/imports/api/engage/engage';
import { AutoAndManualForm } from '../components';

function composer({ messageId, kind }, onData) {
  const handler = Meteor.subscribe('engage.messages.detail', messageId || '');
  const segmentsHandle = Meteor.subscribe('customers.segments');
  const templatesHandler = Meteor.subscribe('emailTemplates.list');
  const usersHandler = Meteor.subscribe('users.list', {});

  const templates = EmailTemplates.find({}).fetch();

  // wait for detail subscription
  if (
    !handler.ready() ||
    !segmentsHandle.ready() ||
    !templatesHandler.ready() ||
    !usersHandler.ready()
  ) {
    return null;
  }

  // callback
  const callback = error => {
    if (error) {
      Alert.error(error.reason || error.message);
    } else {
      Alert.success('Form is successfully saved.');
      FlowRouter.go('/engage');
    }
  };

  const message = Messages.findOne({ _id: messageId });

  // save
  const save = doc => {
    doc.kind = message ? message.kind : kind;

    if (messageId) {
      return Meteor.call('engage.messages.edit', { id: messageId, doc }, callback);
    }

    return Meteor.call('engage.messages.add', { doc }, callback);
  };

  // props
  const segments = Segments.find({}).fetch();
  const users = Meteor.users.find({}).fetch();

  onData(null, { save, message, segments, templates, users });
}

export default compose(getTrackerLoader(composer), composerOptions({}))(AutoAndManualForm);
