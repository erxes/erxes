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

      afterUpload: ({ response, fileInfo }) => {
        const url = response.url ? response.url : response;

        setFile(url);
        setFilePreview({ opacity: '1' });

        saveFile({
          name: fileInfo.name,
          url,
          folderId: queryParams && queryParams._id ? queryParams._id : '',
          type: 'simple',
          info: fileInfo
        });
      }
    });
  };

  const boxContent = (icon: string, title: string) => (
    <ChooseBox>
      <Icon icon={icon} />
      <span>{__(title)}</span>
    </ChooseBox>
  );

  const renderDynamicForm = (icon, title) => {
    const content = pros => (
      <DynamicForm
        {...pros}
        queryParams={props.queryParams}
        documents={props.documents}
        saveFile={props.saveFile}
      />
    );

    return (
      <ModalTrigger
        title="Add File"
        trigger={boxContent(icon, title)}
        content={content}
        centered={true}
        enforceFocus={false}
      />
    );
  };

  const renderBox = (title: string, type: string, icon: string) => {
    if (type === 'simple') {
      const onChange = (e: React.FormEvent<HTMLInputElement>) => handleFile(e);

      if (filePreview && filePreview.opacity === '0.9') {
        return <Spinner />;
      }

      return (
        <FileUpload>
          <label htmlFor="file-upload">
            <input id="file-upload" type="file" onChange={onChange} />
            {boxContent(icon, title)}
          </label>
        </FileUpload>
      );
    }

    if (type === 'dynamic') {
      return renderDynamicForm(icon, title);
    }

    return null;
  };

  if (Object.keys(props.file || {}).length !== 0) {
    return renderDynamicForm('file-check-alt', 'Dynamic file');
  }

  return (
    <FlexContainer>
      {renderBox('Upload File', 'simple', 'upload-6')}
      {renderBox('Dynamic file', 'dynamic', 'file-check-alt')}
    </FlexContainer>
  );
}

export default FileForm;
