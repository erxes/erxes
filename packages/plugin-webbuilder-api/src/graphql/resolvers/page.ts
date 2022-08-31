import { IContext } from '../../connectionResolver';
import { IPageDocument } from '../../models/pages';

export default {
  site(page: IPageDocument, _args, { models }: IContext) {
    return page.siteId && models.Sites.findOne({ _id: page.siteId });
  }
};
