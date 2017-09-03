import channels from './channels';
import brands from './brands';
import forms from './forms';
import responseTemplates from './responseTemplates';
import emailTemplates from './emailTemplates';

export default {
  ...channels,
  ...brands,
  ...forms,
  ...responseTemplates,
  ...emailTemplates,
};
