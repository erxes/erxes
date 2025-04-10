import { Alert, Icon, readFile, uploadHandler } from '@erxes/ui/src';
import { useState, useRef } from 'react';
import React from 'react';
import { QuickReplyImgUploader } from '../../styles';

type Props = {
  onUpload: (image_url: string) => void;
  button: any;
};

export const QuickRepliesImgUploader = ({ button = {}, onUpload }: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewStyle, setPreviewStyle] = useState({});
  const { image_url = '' } = button;

  const handleImageChange = e => {
    const file = e.target.files;
    if (file) {
      uploadHandler({
        files: file,

        beforeUpload: () => {
          setPreviewStyle({ opacity: '0.2' });
        },

        afterUpload: ({ response, status }) => {
          setPreviewStyle({ opacity: '1' });

          if (status === 'ok') {
            Alert.info('Looking good!');
          } else {
            Alert.error(response);
            return;
          }
          onUpload(response);
        },
      });
    }
  };

  const triggerFileInput = () => {
    fileInputRef?.current?.click();
  };

  return (
    <QuickReplyImgUploader onClick={triggerFileInput}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {image_url ? (
        <img
          src={readFile(image_url)}
          alt="Preview"
          style={{
            ...previewStyle,
          }}
        />
      ) : (
        <div>
          <Icon icon="upload-6" size={12} />
        </div>
      )}
    </QuickReplyImgUploader>
  );
};
