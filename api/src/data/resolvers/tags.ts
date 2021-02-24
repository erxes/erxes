import { Tags } from '../../db/models';
import { ITagDocument } from '../../db/models/definitions/tags';

export default {
  async totalObjectCount(tag: ITagDocument) {
    if (tag.relatedIds && tag.relatedIds.length > 0) {
      let objectCount = tag.objectCount || 0;

      const tags = await Tags.find({ _id: { $in: tag.relatedIds } }).select(
        'objectCount'
      );

      for (const item of tags) {
        objectCount += item.objectCount || 0;
      }

      return objectCount;
    }
  }
};
