import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';

const CategoryQueries: IObjectTypeResolver<any, IContext> = {
  forumAllCategories: (parent, args, { models }) => {
    const { _ids, parentIds, ancestorIds } = args;
    const query: any = {};
    if (_ids) {
      query._id = { $in: _ids };
    }

    if (parentIds) {
      query.parentId = { $in: parentIds };
    }

    if (ancestorIds) {
      query.ancestorIds = { $in: ancestorIds };
    }

    return models.Category.find(query);
  },
  forumCategory: (parent, { _id }, { models }) => {
    return models.Category.findById(_id);
  }
};

export default CategoryQueries;
