import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import { getTrackerLoader } from '/imports/react-ui/utils';
import { Integrations } from '/imports/api/integrations/integrations';
import { Brands } from '/imports/api/brands/brands';
import { Spinner } from '/imports/react-ui/common';
import { ChannelForm } from '../components';


function composer({ channel }, onData) {
  const integrationHandle = Meteor.subscribe('integrations.list', {});
  const userHandle = Meteor.subscribe('users.list', {});
  const brandHandle = Meteor.subscribe('brands.list', 0);

  let selectedIntegrations = [];
  let selectedMembers = [];
  if (channel) {
    selectedIntegrations = Integrations.find({ _id: { $in: channel.integrationIds } }).fetch();
    selectedMembers = Meteor.users.find({ _id: { $in: channel.memberIds } }).fetch();
  }

  if (integrationHandle.ready() && userHandle.ready() && brandHandle.ready()) {
    onData(null, {
      integrations: Integrations.find().fetch(),
      members: Meteor.users.find().fetch(),
      brands: Brands.find().fetch(),
      selectedIntegrations,
      selectedMembers,
    });
  }
}

export default compose(getTrackerLoader(composer), Spinner)(ChannelForm);
