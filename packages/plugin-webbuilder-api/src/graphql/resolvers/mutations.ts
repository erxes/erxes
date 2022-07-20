import { requireLogin } from '@erxes/api-utils/src/permissions';
import { IPage, Pages } from '../../models/pages';
import { IContentType, ContentTypes } from '../../models/contentTypes';
import { IEntry, Entries } from '../../models/entries';

const webbuilderMutations = {
  async webbuilderPagesAdd(_root, doc: IPage) {
    return Pages.createPage(doc);
  },

  async webbuilderPagesEdit(_root, args: { _id: string } & IPage) {
    const { _id, ...doc } = args;

    return Pages.updatePage(_id, doc);
  },

  async webbuilderContentTypesAdd(_root, doc: IContentType) {
    return ContentTypes.create(doc);
  },

  async webbuilderContentTypesEdit(
    _root,
    { _id, ...doc }: { _id: string; doc: IContentType }
  ) {
    await ContentTypes.updateOne({ _id }, { $set: doc });

    return ContentTypes.findOne({ _id });
  },

  async webbuilderContentTypesRemove(_root, { _id }: { _id: string }) {
    return ContentTypes.deleteOne({ _id });
  },

  async webbuilderEntriesAdd(_root, doc: IEntry) {
    return Entries.create(doc);
  }
};

requireLogin(webbuilderMutations, 'webbuilderPagesAdd');
requireLogin(webbuilderMutations, 'webbuilderPagesEdit');

export default webbuilderMutations;
