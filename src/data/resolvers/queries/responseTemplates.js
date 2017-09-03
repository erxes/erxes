import { ResponseTemplates } from '../../../db/models';

export default {
  responseTemplates(root, { limit }) {
    return ResponseTemplates.find({}).limit(limit);
  },

  totalResponseTemplatesCount() {
    return ResponseTemplates.find({}).count();
  },
};
