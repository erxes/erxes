import conversations from './conversations';
import tags from './tags';
import engages from './engages';
import brands from './brands';
import emailTemplates from './emailTemplates';
import responseTemplates from './responseTemplates';
import channels from './channels';
import forms from './forms';
import integrations from './integrations';
import notifications from './notifications';

export default {
  ...conversations,
  ...tags,
  ...engages,
  ...brands,
  ...emailTemplates,
  ...responseTemplates,
  ...channels,
  ...forms,
  ...integrations,
  ...notifications,
};
