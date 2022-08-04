import React from 'react';
import { ModalTrigger, Uploader, __ } from 'erxes-ui';
import { FlexItem, FlexPad } from 'modules/common/components/step/styles';
import { IAttachment } from 'modules/common/types';
import { Description, SubHeading } from 'modules/settings/styles';
import { FullContent, UploadText } from '../../styles';
import ManageColumns from 'modules/settings/properties/containers/ManageColumns';
import { renderIcon, renderText } from '../../utils';

type Props = {
  onChangeAttachment: (files: IAttachment[], contentType: string) => void;
  contentTypes: string[];
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
        onChangeAttachment(attachmentsAtt, contentType);

      return (
        <div key={contentType} style={{ marginTop: '20px' }}>
          <UploadText>
            <p>{renderText(contentType)}</p>
            {this.renderColumnChooser(contentType)}
          </UploadText>

          <Uploader
            text={`Choose a file to upload your ${renderText(contentType)}.`}
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
