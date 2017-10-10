import conversation from './conversation';
import brands from './brands';
import emailTemplate from './emailTemplate';
import responseTemplate from './responseTemplate';
import channel from './channel';
import form from './form';
import integration from './integration';
import notification from './notification';

export default {
  ...conversation,
  ...brands,
  ...emailTemplate,
  ...responseTemplate,
  ...channel,
  ...form,
  ...integration,
  ...notification,
};
