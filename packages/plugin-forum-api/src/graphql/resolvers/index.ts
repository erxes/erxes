import customScalars from '@erxes/api-utils/src/customScalars';
import ForumCategory from './ForumCategory';
import { IContext } from '../';
import Mutation from './Mutation';

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
    Mutation
  };
}
