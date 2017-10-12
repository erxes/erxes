import conversations from './conversations';
import brands from './brands';
import emailTemplates from './emailTemplates';
import responseTemplates from './responseTemplates';

export default {
  ...conversations,
  ...brands,
  ...emailTemplates,
  ...responseTemplates,
};
