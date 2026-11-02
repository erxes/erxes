export const CHANNEL_CONTENT_TYPE = 'frontline:channel';
export const CHANNEL_MEMBERS_CONTENT_TYPE = 'frontline:channel-members';
export const PIPELINE_CONTENT_TYPE = 'frontline:pipeline';
export const TICKET_STATUS_CONTENT_TYPE = 'frontline:ticket-status';
export const TICKET_CONFIG_CONTENT_TYPE = 'frontline:ticket-config';
export const PIPELINE_LAYOUT_CONTENT_TYPE = 'frontline:pipeline-layout';
export const RESPONSE_TEMPLATE_CONTENT_TYPE = 'frontline:response-template';
export const FORM_SUBMISSION_CONTENT_TYPE = 'frontline:form-submission';

export const SETTINGS_RECORD_CONTENT_TYPES = new Set<string>([
  CHANNEL_CONTENT_TYPE,
  CHANNEL_MEMBERS_CONTENT_TYPE,
  PIPELINE_CONTENT_TYPE,
  TICKET_STATUS_CONTENT_TYPE,
  TICKET_CONFIG_CONTENT_TYPE,
  PIPELINE_LAYOUT_CONTENT_TYPE,
  RESPONSE_TEMPLATE_CONTENT_TYPE,
  FORM_SUBMISSION_CONTENT_TYPE,
]);
