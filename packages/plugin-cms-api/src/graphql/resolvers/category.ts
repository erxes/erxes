import { IContext } from '../../connectionResolver';
import { IPostCategoryDocument } from '../../models/definitions/categories';

const PostCategory = {
//   async clientPortal(
//     category: IPostCategoryDocument,
//     _params,
//     { models }: IContext
//   ) {
//     return (
//       category.clientPortalId && {
//         __typename: 'ClientPortal',
//         _id: category.clientPortalId,
//       }
//     );
//   },

  async parent(category: IPostCategoryDocument, _params, { models }: IContext) {
    if (!category.parentId) {
      return null;
    }
    return models.Categories.findOne({ _id: category.parentId });
  }
};

export { PostCategory };
