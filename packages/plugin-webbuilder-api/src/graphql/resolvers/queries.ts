import { requireLogin } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../connectionResolver';

const webbuilderQueries = {
  webbuilderPages(_root, _args, { models }: IContext) {
    return models.Pages.find({});
  },

  webbuilderPageDetail(_root, { _id }, { models }: IContext) {
    return models.Pages.findOne({ _id });
  },

  webbuilderContentTypes(_root, _args, { models }: IContext) {
    return models.ContentTypes.find({});
  },

  webbuilderContentTypeDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return models.ContentTypes.findOne({ _id });
  },
  webbuilderEntries(
    _root,
    { contentTypeId }: { contentTypeId: string },
    { models }: IContext
  ) {
    return models.Entries.find({ contentTypeId });
  },
  webbuilderEntryDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Entries.findOne({ _id });
  }
};

requireLogin(webbuilderQueries, 'webbuilderPages');
requireLogin(webbuilderQueries, 'webbuilderPageDetail');

export default webbuilderQueries;
