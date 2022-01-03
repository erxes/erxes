import { ITagDocument } from '../../db/models/definitions/tags';
import { getCollection } from '../../db/models/Tags';
import { Tags } from '../../db/models';

const getCount = async (tag: ITagDocument) => {
  const { type, _id } = tag;
  const collection = getCollection(type);
  return await collection.countDocuments({ tagIds: { $in: [_id] } });
};

export default {
  __resolveReference({ _id }) {
    return Tags.findOne({ _id });
  },
  async totalObjectCount(tag: ITagDocument) {
    if (tag.relatedIds && tag.relatedIds.length > 0) {
      const tagIds = tag.relatedIds.concat(tag._id);
      const Collection = getCollection(tag.type);
      return Collection.countDocuments({ tagIds: { $in: tagIds } });
    }
  },

  async objectCount(tag: ITagDocument) {
    return getCount(tag);
  }
};
