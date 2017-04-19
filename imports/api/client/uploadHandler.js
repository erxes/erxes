import { Meteor } from 'meteor/meteor';
import uploadHandlerBase from './uploadHandlerBase';

export default function uploadHandler(params) {
  const { file, afterRead, beforeUpload, afterUpload } = params;

  uploadHandlerBase({
    // Blob object
    file,

    // for preview purpose
    afterRead,

    // main upload action
    uploadAction: ({ data, fileInfo }) => {
      // before upload
      if (beforeUpload) {
        beforeUpload();
      }

      Meteor.call('uploadFile', { name: file.name, data }, (err, response) => {
        if (err) {
          throw new Error(err);
        }

        // after upload
        if (afterUpload) {
          afterUpload({ response, fileInfo });
        }
      });
    },
  });
}
