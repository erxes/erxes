/* global FileReader, WebSocket */

import EJSON from 'meteor-ejson';
import DDP from 'ddp.js';
import settings from './settings';


/**
 * Upload handler tools which is used in both api & main projects
 * @param  {Object}   options.file         blob object
 * @param  {Function} options.afterRead    for preview purpose
 * @param  {Function} options.uploadAction main upload method
 */
export default function uploadHandler({ file, afterRead, uploadAction }) {
  // initiate upload file reader
  const uploadReader = new FileReader();

  const { name, size, type } = file;
  const fileInfo = { name, size, type };

  // after read process is done
  uploadReader.onloadend = () => {
    const data = new Uint8Array(uploadReader.result);
    uploadAction({ data, fileInfo });
  };

  // begin read
  uploadReader.readAsArrayBuffer(file);

  // read as data url for preview purposes
  if (afterRead) {
    const reader = new FileReader();

    reader.onloadend = () => {
      afterRead({
        result: reader.result,
        fileInfo,
      });
    };

    reader.readAsDataURL(file);
  }
}

// create ddp instance
const ddp = new DDP({
  endpoint: settings.DDP_URL,
  SocketConstructor: WebSocket,
});

/**
 * Send file to main project via ddp
 * @param  {String}   object.name   file name
 * @param  {Object}   object.data   Uint8Array
 * @param  {Function} callback      success callback
 */
export const uploadFile = ({ name, data }, callback) => {
  // prepare data for ddp
  const doc = {
    name,
    data: EJSON.toJSONValue(data),
  };

  if (!ddp) {
    throw Error('Not connected to the DDP server');
  }

  // call method
  const methodId = ddp.method('uploadFile', [doc]);

  // receive method result
  ddp.on('result', (response) => {
    if (response.id === methodId && !response.error) {
      callback(response.result);
    }
  });
};
