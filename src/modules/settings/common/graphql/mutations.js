import { mutations as channelMutation } from 'modules/settings/channels/graphql';
import { mutations as brandMutation } from 'modules/settings/brands/graphql';

export default {
  channelEdit: channelMutation.channelEdit,
  brandManageIntegrations: brandMutation.brandManageIntegrations
};
