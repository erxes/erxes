import { Meteor } from 'meteor/meteor';
import { composeWithTracker } from 'react-komposer';
import { Integrations } from '/imports/api/integrations/integrations';
import { Brands } from '/imports/api/brands/brands';
import { Spinner } from '/imports/react-ui/common';
import { ChannelForm } from '../components';


function composer({ channel }, onData) {
  const integrationHandle = Meteor.subscribe('integrations.list', {});
  const userHandle = Meteor.subscribe('users.list', {});
  const brandHandle = Meteor.subscribe('brands.list');

  let selectedIntegrations = [];
  if (channel) {
    selectedIntegrations = Integrations.find({ _id: { $in: channel.integrationIds } }).fetch();
  }

  if (integrationHandle.ready() && userHandle.ready() && brandHandle.ready()) {
    onData(null, {
      integrations: Integrations.find().fetch(),
      members: Meteor.users.find().fetch(),
      brands: Brands.find().fetch(),
      selectedIntegrations,
    });
  }
}

export default composeWithTracker(composer, Spinner)(ChannelForm);
