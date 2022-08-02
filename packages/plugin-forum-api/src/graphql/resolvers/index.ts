import customScalars from '@erxes/api-utils/src/customScalars';
import ForumCategory from './ForumCategory';
import { IContext } from '../';

export default async function generateResolvers(serviceDiscovery) {
  return {
    ...customScalars,
    ForumCategory,
    Query: {
      forumAllCategories: (parent, args, { models }: IContext) => {
        return models.Category.find();
      },
      forumCategory: (parent, { _id }, { models }: IContext) => {
        return models.Category.findById(_id);
      }
    },
    Mutation: {
      forumTestMutation: () => {
        return 'hello';
      },
      async forumCreateCategory(_, args, { models: { Category } }: IContext) {
        return await Category.create(args);
      }
    }
  };
}
