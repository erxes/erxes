import channels from './channels';
import brands from './brands';
import responseTemplates from './responseTemplates';
import emailTemplates from './emailTemplates';

export default {
  ...channels,
  ...brands,
  ...responseTemplates,
  ...emailTemplates,
};
