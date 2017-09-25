import { ResponseTemplates } from '../../../db/models';

export default {
  responseTemplates(root, { limit }) {
    const responseTemplate = ResponseTemplates.find({});

    if (limit) {
      return responseTemplate.limit(limit);
    }

    return responseTemplate;
  },

  responseTemplatesTotalCount() {
    return ResponseTemplates.find({}).count();
  },
};
