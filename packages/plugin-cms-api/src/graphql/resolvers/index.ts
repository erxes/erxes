import customScalars from '@erxes/api-utils/src/customScalars';
import CmsCategory from './CmsCategory';
import { IContext } from '../';

export default function generateResolvers(serviceDiscovery) {
  return {
    ...customScalars,
    CmsCategory,
    Query: {
      cmsAllCategories: (parent, args, { models }: IContext) => {
        return models.Category.find();
      }
    },
    Mutation: {
      cmsTestMutation: () => {
        return 'hello';
      },
      async cmsCreateCategory(_, args, { models: { Category } }: IContext) {
        return await Category.create(args);
      }
    }
  };
}
