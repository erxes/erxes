import conversation from './conversation';
import brands from './brands';
import emailTemplate from './emailTemplate';
import responseTemplate from './responseTemplate';
import channels from './channels';
import forms from './forms';
import integrations from './integrations';
import notifications from './notifications';

export default {
  ...conversation,
  ...brands,
  ...emailTemplate,
  ...responseTemplate,
  ...channels,
  ...forms,
  ...integrations,
  ...notifications,
};
