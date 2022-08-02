import { IContext } from '../../connectionResolver';

export default {
  entries(contentType: any, _args, { models }: IContext) {
    return models.Entries.find({ contentTypeId: contentType._id }).lean();
  }
};
