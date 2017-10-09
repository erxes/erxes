import conversation from './conversation';
import brands from './brands';
import emailTemplate from './emailTemplate';
import responseTemplate from './responseTemplate';
import customers from './customers';
import segments from './segments';
import companies from './companies';
import fields from './fields';

export default {
  ...conversation,
  ...brands,
  ...emailTemplate,
  ...responseTemplate,
  ...customers,
  ...segments,
  ...companies,
  ...fields,
};
