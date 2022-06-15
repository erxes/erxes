import React from 'react';

import { FlexItem, FlexPad } from 'modules/common/components/step/styles';
import { IAttachment } from 'modules/common/types';
import { FullContent, UploadText } from '../../styles';
import { renderIcon, renderText } from '../../utils';
import { IImportHistoryContentType } from '../../types';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import ManageColumns from '@erxes/ui-settings/src/properties/containers/ManageColumns';
import Uploader from '@erxes/ui/src/components/Uploader';
import { __ } from 'modules/common/utils';
import { ImportHeader, FileUploadBox } from '../../styles';

type Props = {
  onChangeAttachment: (files: IAttachment[], contentType: string) => void;
  contentTypes: IImportHistoryContentType[];
  type: string;
};

class FileUpload extends React.Component<Props, {}> {
  renderColumnChooser = (currentType: string) => {
    const manageColumns = props => {
      return (
        <ManageColumns
          {...props}
          contentType={currentType}
          type={'import'}
          isImport={true}
        />
      );
    };

    const editColumns = <span>{__(`Download template`)}</span>;

    return (
      <ModalTrigger
        title="Select Columns"
        trigger={editColumns}
        content={manageColumns}
        autoOpenKey="showManageColumnsModal"
      />
    );
  };

  rendertContent = () => {
    const { contentTypes, onChangeAttachment } = this.props;

    return contentTypes.map(contentType => {
      const onChange = attachmentsAtt =>
        onChangeAttachment(attachmentsAtt, contentType.contentType);

      return (
        <FileUploadBox key={contentType.contentType}>
          <UploadText>
            <p>{renderText(contentType.contentType)}</p>
            {this.renderColumnChooser(contentType.contentType)}
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
