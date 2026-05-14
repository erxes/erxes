import { IPostTagDocument } from '@/cms/@types/posts';
import { IContext } from '~/connectionResolvers';

const PostTag = {
  async translations(tag: IPostTagDocument, _params, { models }: IContext) {
    return models.Translations.find({
      objectId: tag._id,
      type: 'tag',
    }).lean();
  },
};

export { PostTag };
