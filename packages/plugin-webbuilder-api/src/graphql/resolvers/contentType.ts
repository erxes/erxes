import { IContext } from '../../connectionResolver';
import { IContentTypeDocument } from '../../models/contentTypes';

export default {
  entries(contentType: IContentTypeDocument, _args, { models }: IContext) {
    return models.Entries.find({ contentTypeId: contentType._id }).lean();
  },

  site(contentType: IContentTypeDocument, _args, { models }: IContext) {
    return (
      contentType.siteId &&
      models.Sites.findOne({
        _id: contentType.siteId
      })
    );
  }
};
