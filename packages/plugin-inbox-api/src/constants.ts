import { ruleSchema } from '@erxes/api-utils/src/definitions/common';

import { channelSchema } from "./models/definitions/channels";
import { responseTemplateSchema } from './models/definitions/responseTemplates';
import { calloutSchema, integrationSchema, leadDataSchema } from "./models/definitions/integrations";

export const MODULE_NAMES = {
  CHANNEL: 'channel',
  EMAIL_TEMPLATE: 'emailTemplate',
  RESPONSE_TEMPLATE: 'responseTemplate',
  CONVERSATION: 'conversation',
  INTEGRATION: 'integration',
};

export const LOG_MAPPINGS = [
  {
    name: MODULE_NAMES.CHANNEL,
    schemas: [channelSchema]
  },
  {
    name: MODULE_NAMES.RESPONSE_TEMPLATE,
    schemas: [responseTemplateSchema]
  },
  {
    name: MODULE_NAMES.INTEGRATION,
    schemas: [calloutSchema, integrationSchema, leadDataSchema, ruleSchema]
  }
];
