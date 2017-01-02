/* eslint-disable no-underscore-dangle */
/* eslint-disable new-cap */

import { Match, check } from 'meteor/check';
import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { uploadFile } from '/imports/api/server/utils';

// **************************** Public methods ********************** //

export const sendFile = new ValidatedMethod({
  name: 'api.sendFile',

  validate({ name, data }) {
    check(name, String);
    check(data, Match.Any);
  },

  run(doc) {
    return uploadFile(doc);
  },
});
