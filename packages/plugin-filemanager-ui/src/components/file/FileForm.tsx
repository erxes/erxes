import { ChooseBox, FileUpload, FlexContainer } from '../../styles';
import React, { useState } from 'react';

import { IButtonMutateProps } from '@erxes/ui/src/types';
import { IFile } from '../../types';
import Icon from '@erxes/ui/src/components/Icon';
import Spinner from '@erxes/ui/src/components/Spinner';
import { __ } from 'coreui/utils';
import { uploadHandler } from '@erxes/ui/src/utils';

type Props = {
  file?: IFile;
  queryParams: any;
  saveSimpleFile: (attr: any) => void;
  closeModal: () => void;
};

function FileForm(props: Props) {
  const [file, setFile] = useState({});
  const [filePreview, setFilePreview] = useState({} as any);

  const handleFile = (e: React.FormEvent<HTMLInputElement>) => {
    const { queryParams, saveSimpleFile } = props;
    const imageFile = e.currentTarget.files;

    uploadHandler({
      files: imageFile,

      beforeUpload: () => {
        setFilePreview({ opacity: '0.9' });
      },

      afterUpload: ({ response }) => {
        setFile(response);
        setFilePreview({ opacity: '1' });

        saveSimpleFile({
          name: `Simple File - ${response}`,
          url: response,
          folderId: queryParams && queryParams._id ? queryParams._id : '',
          type: 'simple'
        });
      }
    });
  };

  const renderBox = (title: string, type: string, icon: string) => {
    const boxContent = (
      <ChooseBox>
        <Icon icon={icon} />
        <span>{__(title)}</span>
      </ChooseBox>
    );

    if (type === 'simple') {
      const onChange = (e: React.FormEvent<HTMLInputElement>) => handleFile(e);

      if (filePreview && filePreview.opacity === '0.9') {
        return <Spinner />;
      }

      return (
        <FileUpload>
          <label htmlFor="file-upload">
            <input
              id="file-upload"
              type="file"
              onChange={onChange}
              accept="image/x-png,image/jpeg"
            />
            {boxContent}
          </label>
        </FileUpload>
      );
    }

    return boxContent;
  };

  return (
    <FlexContainer>
      {renderBox('Upload File', 'simple', 'upload-6')}
      {renderBox('Dynamic file', 'dynamic', 'file-check-alt')}
    </FlexContainer>
  );
}

export default FileForm;
