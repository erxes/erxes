import { ChooseBox, FileUpload, FlexContainer } from '../../styles';
import React, { useState } from 'react';

import DynamicForm from './DynamicForm';
import { IFile } from '../../types';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Spinner from '@erxes/ui/src/components/Spinner';
import { __ } from 'coreui/utils';
import { uploadHandler } from '@erxes/ui/src/utils';

type Props = {
  file?: IFile;
  queryParams: any;
  documents: any;
  saveFile: (attr: any) => void;
  closeModal: () => void;
};

function FileForm(props: Props) {
  const [file, setFile] = useState({});
  const [filePreview, setFilePreview] = useState({} as any);

  const handleFile = (e: React.FormEvent<HTMLInputElement>) => {
    const { queryParams, saveFile } = props;
    const imageFile = e.currentTarget.files;

    uploadHandler({
      files: imageFile,

      beforeUpload: () => {
        setFilePreview({ opacity: '0.9' });
      },

      afterUpload: ({ response }) => {
        setFile(response);
        setFilePreview({ opacity: '1' });

        saveFile({
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

    const content = pros => (
      <DynamicForm
        {...pros}
        queryParams={props.queryParams}
        documents={props.documents}
        saveFile={props.saveFile}
      />
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

    if (type === 'dynamic') {
      return (
        <ModalTrigger
          title="Add File"
          trigger={boxContent}
          content={content}
          centered={true}
          enforceFocus={false}
        />
      );
    }

    return null;
  };

  return (
    <FlexContainer>
      {renderBox('Upload File', 'simple', 'upload-6')}
      {renderBox('Dynamic file', 'dynamic', 'file-check-alt')}
    </FlexContainer>
  );
}

export default FileForm;
