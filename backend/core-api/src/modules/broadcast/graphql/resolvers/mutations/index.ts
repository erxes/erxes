import { engageMutations } from './engage';
import { emailTemplateMutations } from './emailTemplate';

export const broadcastMutations = {
  ...engageMutations,
  ...emailTemplateMutations,
};
