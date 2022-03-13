import { ITagDocument } from '../../models/definitions/tags';
import { countDocuments } from '../../utils';

const getCount = async (tag: ITagDocument, serviceDiscovery) => {
  const { type, _id } = tag;

  return countDocuments(type, [_id], serviceDiscovery);
};

const tags = (serviceDiscovery) => ({
  __resolveReference({ _id, models }) {
    return models.Tags.findOne({ _id });
  },

  async totalObjectCount(tag: ITagDocument) {
    if (tag.relatedIds && tag.relatedIds.length > 0) {
      const tagIds = tag.relatedIds.concat(tag._id);

      return countDocuments(tag.type, tagIds, serviceDiscovery);
    }
  },

  async objectCount(tag: ITagDocument) {
    return getCount(tag, serviceDiscovery);
  },
});

export default tags;
