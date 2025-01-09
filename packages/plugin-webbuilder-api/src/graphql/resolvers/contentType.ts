import { IContext } from '../../connectionResolver';
import { IContentTypeDocument } from '../../models/definitions/contentTypes';

export default {
  async entries(contentType: IContentTypeDocument, _args, { models }: IContext) {
    return models.Entries.find({ contentTypeId: contentType._id }).lean();
  },

  async site(contentType: IContentTypeDocument, _args, { models }: IContext) {
    return (
      contentType.siteId &&
      await models.Sites.findOne({
        _id: contentType.siteId
      })
    );
  }
};
