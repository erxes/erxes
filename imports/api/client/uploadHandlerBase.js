/*
 * Using in both api & main projects
 */

export default function uploadHandlerBase(params) {
  const {
    // Blob object
    file,

    // for preview purpose
    afterRead,

    // main upload method
    uploadAction,
  } = params;

  // initiate upload file reader
  const uploadReader = new FileReader();

  const fileInfo = { name: file.name, size: file.size, type: file.type };

  // after read proccess done
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
