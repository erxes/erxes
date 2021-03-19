import { Tags } from '../../db/models';
import { ITagDocument } from '../../db/models/definitions/tags';
import { getCollection } from '../../db/models/Tags';

const getCount = async (tag: ITagDocument) => {
  const { type, _id } = tag;

  const collection = getCollection(type);

  return await collection.countDocuments({ tagIds: { $in: [_id] } });
};

export default {
  async totalObjectCount(tag: ITagDocument) {
    if (tag.relatedIds && tag.relatedIds.length > 0) {
      let objectCount = await getCount(tag);

      const tags = await Tags.find({ _id: { $in: tag.relatedIds } });

      for (const item of tags) {
        objectCount += await getCount(item);
      }

      return objectCount;
    }
  },

  async objectCount(tag: ITagDocument) {
    return getCount(tag);
  }
};
