import { IContext } from '../../connectionResolver';
import { IPostCategoryDocument } from '../../models/definitions/categories';

const Page = {


  async createdUser(page: any, _params, { models }: IContext) {
    if (!page.createdUserId) {
      return null;
    }


    return {
      __typename: 'User',
      _id: page.createdUserId,
    };
  }
};

export { Page };
