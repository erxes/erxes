import { IPageDocument } from '../../models/pages';
import { IContext } from '../../connectionResolver';

export default {
  site(page: IPageDocument, _args, { models }: IContext) {
    return page.siteId && models.Sites.findOne({ _id: page.siteId });
  },

  createdUser(page: IPageDocument) {
    return (
      page.createdBy && {
        __typename: 'User',
        _id: page.createdBy
      }
    );
  },

  updatedUser(page: IPageDocument) {
    return (
      page.modifiedBy && {
        __typename: 'User',
        _id: page.modifiedBy
      }
    );
  }
};
