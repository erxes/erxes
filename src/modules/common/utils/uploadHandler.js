const uploadHandler = params => {
  const { REACT_APP_API_URL } = process.env;

  const {
    file,
    beforeUpload,
    afterUpload,
    afterRead,
    url = `${REACT_APP_API_URL}/upload-file`,
    responseType = 'text',
    extraFormData = []
  } = params;

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

    for (const data of extraFormData) {
      formData.append(data.key, data.value);
    }

    fetch(url, {
      method: 'post',
      body: formData,
      headers: {
        'x-token': localStorage.getItem('erxesLoginToken'),
        'x-refresh-token': localStorage.getItem('erxesLoginRefreshToken')
      }
    })
      .then(response => {
        return response[responseType]();
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
    if (afterRead) {
      afterRead({ result: reader.result, fileInfo });
    }
  };

  reader.readAsDataURL(file);
};

export default uploadHandler;
