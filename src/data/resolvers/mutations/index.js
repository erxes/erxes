import conversation from './conversation';
import tags from './tags';
import engages from './engages';
import brands from './brands';
import emailTemplate from './emailTemplate';
import responseTemplate from './responseTemplate';

export default {
  ...conversation,
  ...tags,
  ...engages,
  ...brands,
  ...emailTemplate,
  ...responseTemplate,
};
