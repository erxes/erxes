import conversation from './conversation';
import brands from './brands';
import emailTemplate from './emailTemplate';
import responseTemplate from './responseTemplate';

export default {
  ...conversation,
  ...brands,
  ...emailTemplate,
  ...responseTemplate,
};
