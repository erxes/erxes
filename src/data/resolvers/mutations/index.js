import conversations from './conversations';
import brands from './brands';
import emailTemplate from './emailTemplate';
import responseTemplate from './responseTemplate';

export default {
  ...conversations,
  ...brands,
  ...emailTemplate,
  ...responseTemplate,
};
