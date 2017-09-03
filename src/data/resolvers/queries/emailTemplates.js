import { EmailTemplates } from '../../../db/models';

export default {
  emailTemplates(root, { limit }) {
    return EmailTemplates.find({}).limit(limit);
  },

  totalEmailTemplatesCount() {
    return EmailTemplates.find({}).count();
  },
};
