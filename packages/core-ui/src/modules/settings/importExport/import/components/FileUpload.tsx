import {
  FileUploadBox,
  FullContent,
  ImportHeader,
  UploadText
} from '../../styles';
import { FlexItem, FlexPad } from 'modules/common/components/step/styles';
import { __, loadDynamicComponent } from 'modules/common/utils';
import { renderIcon, renderText } from '../../utils';

import { IAttachment } from 'modules/common/types';
import { IImportHistoryContentType } from '../../types';
import React from 'react';
import Uploader from '@erxes/ui/src/components/Uploader';

type Props = {
  onChangeAttachment: (files: IAttachment[], contentType: string) => void;
  contentTypes: IImportHistoryContentType[];
  type: string;
};

class FileUpload extends React.Component<Props, {}> {
  rendertContent = () => {
    const { contentTypes, onChangeAttachment } = this.props;

    return contentTypes.map(contentType => {
      const onChange = attachmentsAtt =>
        onChangeAttachment(attachmentsAtt, contentType.contentType);

      return (
        <FileUploadBox key={contentType.contentType}>
          <UploadText>
            <p>{renderText(contentType.contentType)}</p>
            {loadDynamicComponent('importExportUploadForm', {
              contentType: contentType.contentType
            })}
          </UploadText>

          <Uploader
            text={`Choose a file to upload your ${renderText(
              contentType.contentType
            )}.`}
            warningText={'Only .csv file is supported.'}
            icon={renderIcon(contentType)}
            accept=".csv"
            single={true}
            defaultFileList={[]}
            onChange={onChange}
          />
        </FileUploadBox>
      );
    });
  };

  render() {
    return (
      <FlexItem>
        <FlexPad direction="column" overflow="auto">
          <ImportHeader>{__(`Upload your file`)}</ImportHeader>
          <ImportHeader fontSize="small">
            {__(
              'Before you upload your files below, make sure your file is ready to be imported.'
            )}
          </ImportHeader>
          <FullContent center={true}>
            <div style={{ marginBottom: '30px' }}>{this.rendertContent()}</div>
          </FullContent>
        </FlexPad>
      </FlexItem>
    );
  }
}

export default FileUpload;
