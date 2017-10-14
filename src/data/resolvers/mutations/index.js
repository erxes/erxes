import conversation from './conversation';
import brands from './brands';
import emailTemplate from './emailTemplate';
import responseTemplate from './responseTemplate';
import internalNotes from './internalNotes';
import customers from './customers';
import segments from './segments';
import companies from './companies';
import fields from './fields';
import channels from './channels';
import forms from './forms';
import integrations from './integrations';
import notifications from './notifications';

export default {
  ...conversation,
  ...brands,
  ...emailTemplate,
  ...responseTemplate,
  ...internalNotes,
  ...customers,
  ...segments,
  ...companies,
  ...fields,
  ...channels,
  ...forms,
  ...integrations,
  ...notifications,
};
