import { EmailTemplates } from '../../../db/models';

export default {
  emailTemplates(root, { limit }) {
    const emailTemplates = EmailTemplates.find({});

    if (limit) {
      return emailTemplates.limit(limit);
    }

    return emailTemplates;
  },

  totalEmailTemplatesCount() {
    return EmailTemplates.find({}).count();
  },
};
