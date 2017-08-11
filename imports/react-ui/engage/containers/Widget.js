import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { EmailTemplates } from '/imports/api/emailTemplates/emailTemplates';
import { Brands } from '/imports/api/brands/brands';
import { MESSENGER_KINDS, SENT_AS_CHOICES, MESSAGE_KINDS } from '/imports/api/engage/constants';
import { Widget } from '../components';
import { methodCallback } from '../utils';

function composer(props, onData) {
  Meteor.subscribe('emailTemplates.list');
  Meteor.subscribe('brands.list');

  // save
  const save = (doc, callback) => {
    doc.kind = MESSAGE_KINDS.MANUAL;
    doc.isLive = true;

    return Meteor.call('engage.messages.add', { doc }, (error, result) => {
      methodCallback(error, result);

      if (!error) {
        callback();
      }
    });
  };

  onData(null, {
    emailTemplates: EmailTemplates.find({}).fetch(),
    brands: Brands.find({}).fetch(),
    save,
    messengerKinds: MESSENGER_KINDS.SELECT_OPTIONS,
    sentAsChoices: SENT_AS_CHOICES.SELECT_OPTIONS,
    ...props,
  });
}

export default compose(getTrackerLoader(composer), composerOptions({}))(Widget);
