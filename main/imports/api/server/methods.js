import { Match, check } from 'meteor/check';
import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { uploadFile } from './utils';

// save binary data to amazon s3
export const uploadFileMethod = new ValidatedMethod({
  name: 'uploadFile',

  validate({ name, data }) {
    check(name, String);
    check(data, Match.Any);
  },

  run(doc) {
    return uploadFile(doc);
  },
});
