import { IContext } from '../../connectionResolver';
import { ITagDocument } from '../../models/definitions/tags';
import { countDocuments } from '../../utils';

const getCount = async (subdomain: string, tag: ITagDocument) => {
  const { type, _id } = tag;

  return countDocuments(subdomain, type, [_id]);
};

const tags = {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Tags.findOne({ _id });
  },

  async totalObjectCount(tag: ITagDocument, _args, { subdomain }: IContext) {
    if (tag.relatedIds && tag.relatedIds.length > 0) {
      const tagIds = tag.relatedIds.concat(tag._id);

      return countDocuments(subdomain, tag.type, tagIds);
    }
  },

  async objectCount(tag: ITagDocument, _args, { subdomain }: IContext) {
    return getCount(subdomain, tag);
  }
};

export default tags;
