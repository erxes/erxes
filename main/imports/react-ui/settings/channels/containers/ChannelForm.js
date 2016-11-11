import { Meteor } from 'meteor/meteor';
import { composeWithTracker } from 'react-komposer';

import { Integrations } from '/imports/api/integrations/integrations';

import { ChannelForm } from '../components';


function composer({ channel }, onData) {
  Meteor.subscribe('integrations.list', {});
  Meteor.subscribe('users.list', {});

  onData(null, {
    integrations: Integrations.find().fetch(),
    members: Meteor.users.find().fetch(),
  });
}

export default composeWithTracker(composer)(ChannelForm);
