import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { Integrations } from '/imports/api/integrations/integrations';
import { ChannelForm } from '../components';

function composer({ object }, onData) {
  const integrationHandle = Meteor.subscribe('integrations.list', {});
  const userHandle = Meteor.subscribe('users.list', {});
  const brandHandle = Meteor.subscribe('brands.list', 0);

  if (integrationHandle.ready() && userHandle.ready() && brandHandle.ready()) {
    let selectedIntegrations = [];
    let selectedMembers = [];

    if (object) {
      selectedIntegrations = Integrations.find({
        _id: { $in: object.integrationIds },
      }).fetch();

      selectedMembers = Meteor.users.find({ _id: { $in: object.memberIds } }).fetch();
    }

    onData(null, {
      integrations: Integrations.find().fetch(),
      members: Meteor.users.find().fetch(),
      selectedIntegrations,
      selectedMembers,
    });
  }
}

export default compose(getTrackerLoader(composer), composerOptions({ spinner: true }))(ChannelForm);
