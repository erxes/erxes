import { engageQueries } from './engage';
import { emailTemplateQueries } from './emailTemplate';

export const broadcastQueries = {
  ...engageQueries,
  ...emailTemplateQueries,
};
