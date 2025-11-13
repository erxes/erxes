import { ITagDocument } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';
import { countDocuments } from '~/modules/tags/utils';

export default {
  async __resolveReference({ _id }: { _id: string }, { models }: IContext) {
    return models.Tags.findOne({ _id });
  },

  async totalObjectCount(
    tag: ITagDocument,
    _args: undefined,
    { subdomain }: IContext,
  ) {

    if(!tag.type) {
      return 0;
    }

    if (tag.relatedIds && tag.relatedIds.length > 0) {
      const tagIds = tag.relatedIds.concat(tag._id);

      return countDocuments(subdomain, tag.type, tagIds);
    }
  },

  async objectCount(
    tag: ITagDocument,
    _args: undefined,
    { subdomain }: IContext,
  ) {
    if(!tag.type) {
      return 0;
    }

    return countDocuments(subdomain, tag.type, [tag._id]);
  },
};
