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
