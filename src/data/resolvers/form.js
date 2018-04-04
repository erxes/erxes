import { Tags } from '../../db/models';

export default {
  getTags(form) {
    return Tags.find({ _id: { $in: form.tagIds || [] } });
  },
};
