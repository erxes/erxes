import conversation from './conversation';
import tags from './tags';
import engages from './engages';
import brands from './brands';
import emailTemplate from './emailTemplate';
import responseTemplate from './responseTemplate';
import channels from './channels';
import forms from './forms';
import integrations from './integrations';
import notifications from './notifications';

export default {
  ...conversation,
  ...tags,
  ...engages,
  ...brands,
  ...emailTemplate,
  ...responseTemplate,
  ...channels,
  ...forms,
  ...integrations,
  ...notifications,
};
