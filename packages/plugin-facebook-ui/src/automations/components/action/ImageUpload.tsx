import React, { useEffect, useState } from 'react';
import { ImagePreview, UploadWrapper } from '../../styles';
import Alert from '@erxes/ui/src/utils/Alert/index';
import Icon from '@erxes/ui/src/components/Icon';
import Spinner from '@erxes/ui/src/components/Spinner';
import { readFile } from '@erxes/ui/src/utils/core';
import uploadHandler from '@erxes/ui/src/utils/uploadHandler';
type Props = {
  src?: string;
  onUpload: (response: any) => void;
  label?: string;
  alertText?: string;
  fileType?: string;
};

function ImageUploader({ onUpload, src, label, alertText, fileType }: Props) {
  const [uploadPreview, setUploadPreview] = useState(null as any);
  const [previewUrl, setPreviewUrl] = useState(src);
  const [previewStyle, setPreviewStyle] = useState({});

  useEffect(() => {
    setPreviewUrl(src);
  }, [src]);

  const handleImageChange = (e) => {
    const file = e.target.files;

    uploadHandler({
      files: file,

      beforeUpload: () => {
        setPreviewStyle({ opacity: '0.2' });
      },

      afterUpload: ({ response, status }) => {
        setPreviewStyle({ opacity: '1' });

        // call success event
        onUpload(response);

        // remove preview
        if (setUploadPreview) {
          setUploadPreview(null);
        }

        if (status === 'ok') {
          Alert.info(alertText || 'Looking good!');
        } else {
          Alert.error(response);
        }
      },

      afterRead: ({ result, fileInfo }) => {
        if (setUploadPreview) {
          setUploadPreview(Object.assign({ data: result }, fileInfo));
        }

        setPreviewUrl(result);
      },
    });
  };

  const renderUploadLoader = () => {
    if (uploadPreview) {
      return <Spinner />;
    }

    return null;
  };

  if (!previewUrl) {
    return (
      <UploadWrapper>
        <label>
          <div>
            <Icon icon="export" size={30} />
            <p>{label || 'Upload Image'}</p>
          </div>
          <input type="file" accept={fileType} onChange={handleImageChange} />
        </label>
      </UploadWrapper>
    );
  }

  return (
    <ImagePreview>
      <img alt="image" style={previewStyle} src={readFile(previewUrl)} />
      <label>
        <div>
          <Icon icon="export" size={30} />
          <p>{label || 'Upload Image'}</p>
        </div>
        <input type="file" onChange={handleImageChange} />
      </label>
      {renderUploadLoader()}
    </ImagePreview>
  );
}

export default ImageUploader;
