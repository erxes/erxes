import { Users } from '../../db/models';

export default {
  createdUser(article) {
    return Users.findOne({ _id: article.createdBy });
  },
};
