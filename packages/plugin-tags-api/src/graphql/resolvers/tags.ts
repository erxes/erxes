import { ITagDocument } from '../../models/definitions/tags';
import { countDocuments } from '../../utils';

const getCount = async (tag: ITagDocument) => {
  const { type, _id } = tag;

  return countDocuments(type, [_id]);
};

export default {
  async totalObjectCount(tag: ITagDocument) {
    if (tag.relatedIds && tag.relatedIds.length > 0) {
      const tagIds = tag.relatedIds.concat(tag._id);

      return countDocuments(tag.type, tagIds);

    }
  },

  async objectCount(tag: ITagDocument) {
    return getCount(tag);
  }
};
