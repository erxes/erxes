const uploadHandler = params => {
  const {
    // Blob object
    file,

    beforeUpload,
    afterUpload,

    // for preview purpose
    afterRead,
    type
  } = params;

  const { REACT_APP_API_URL } = process.env;
  let url = `${REACT_APP_API_URL}/upload-file`;

  if (type === 'import') {
    url = `${REACT_APP_API_URL}/import-file`;
  }

  // initiate upload file reader
  const uploadReader = new FileReader();

  const fileInfo = { name: file.name, size: file.size, type: file.type };

  // after read proccess done
  uploadReader.onloadend = () => {
    // before upload
    if (beforeUpload) {
      beforeUpload();
    }

    const formData = new FormData();
    formData.append('file', file);

    fetch(url, {
      method: 'post',
      body: formData
    })
      .then(response => {
        return response.text();
      })

      .then(response => {
        // after upload
        if (afterUpload) {
          afterUpload({ response, fileInfo });
        }
      })

      .catch(e => {
        console.log(e); // eslint-disable-line
      });
  };

  // begin read
  uploadReader.readAsArrayBuffer(file);

  // read as data url for preview purposes
  const reader = new FileReader();

  reader.onloadend = () => {
    afterRead({
      result: reader.result,
      fileInfo
    });
  };

  reader.readAsDataURL(file);
};

export default uploadHandler;
