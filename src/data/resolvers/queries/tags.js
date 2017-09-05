import { Tags } from '../../../db/models';

export default {
  tags(root, { type }) {
    return Tags.find({ type });
  },
};
