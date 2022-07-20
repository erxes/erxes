import { requireLogin } from '@erxes/api-utils/src/permissions';

import { Pages } from '../../models/pages';
import { ContentTypes } from '../../models/contentTypes';
import { Entries } from '../../models/entries';

const webbuilderQueries = {
  webbuilderPages(_root) {
    return Pages.find({});
  },

  webbuilderPageDetail(_root, { _id }) {
    return Pages.findOne({ _id });
  },

  webbuilderContentTypes(_root) {
    return ContentTypes.find({});
  },

  webbuilderContentTypeDetail(_root, { _id }: { _id: string }) {
    return ContentTypes.findOne({ _id });
  },
  webbuilderEntries(_root, { contentTypeId }: { contentTypeId: string }) {
    return Entries.find({ contentTypeId });
  },
  webbuilderEntryDetail(_root, { _id }: { _id: string }) {
    return Entries.findOne({ _id });
  }
};

requireLogin(webbuilderQueries, 'webbuilderPages');
requireLogin(webbuilderQueries, 'webbuilderPageDetail');

export default webbuilderQueries;
