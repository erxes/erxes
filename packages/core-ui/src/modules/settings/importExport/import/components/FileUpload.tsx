import React from 'react';

import { FlexItem, FlexPad } from 'modules/common/components/step/styles';
import { IAttachment } from 'modules/common/types';
import { SubHeading, Description } from '@erxes/ui-settings/src/styles';
import { FullContent, UploadText } from '../../styles';
import { renderIcon, renderText } from '../../utils';
import { IImportHistoryContentType } from '../../types';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import ManageColumns from '@erxes/ui-settings/src/properties/containers/ManageColumns';
import Uploader from '@erxes/ui/src/components/Uploader';
import { __ } from '@erxes/ui/src/utils/core';

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
        <div key={contentType.contentType} style={{ marginTop: '20px' }}>
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
        </div>
      );
    });
  };

  render() {
    return (
      <FlexItem>
        <FlexPad direction="column" overflow="auto">
          <SubHeading>{__(`Upload your file`)}</SubHeading>
          <Description>
            {__(
              'Before you upload your files below, make sure your file is ready to be imported.'
            )}
          </Description>
          <FullContent center={true}>
            <div style={{ marginBottom: '100px' }}>{this.rendertContent()}</div>
          </FullContent>
        </FlexPad>
      </FlexItem>
    );
  }
}

export default FileUpload;
