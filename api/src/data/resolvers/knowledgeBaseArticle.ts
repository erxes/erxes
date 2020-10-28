import { Users } from '../../db/models';
import { IArticleDocument } from '../../db/models/definitions/knowledgebase';

export default {
  createdUser(article: IArticleDocument) {
    return Users.findOne({ _id: article.createdBy });
  }
};
