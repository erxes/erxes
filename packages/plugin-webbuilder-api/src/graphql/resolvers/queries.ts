import { requireLogin } from '@erxes/api-utils/src/permissions';

import { Pages } from '../../models';

const webbuilderQueries = {
  webbuilderPages(_root) {
    return Pages.find({});
  },

  webbuilderPageDetail(_root, { _id }) {
    return Pages.findOne({ _id });
  }
};

requireLogin(webbuilderQueries, 'webbuilderPages');
requireLogin(webbuilderQueries, 'webbuilderPageDetail');

export default webbuilderQueries;
