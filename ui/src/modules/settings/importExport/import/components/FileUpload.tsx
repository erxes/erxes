import React from 'react';
import { ModalTrigger, Uploader, __ } from 'erxes-ui';
import { FlexItem, FlexPad } from 'modules/common/components/step/styles';
import { IAttachment } from 'modules/common/types';
import { Description, SubHeading } from 'modules/settings/styles';
import { FullContent, UploadText } from '../../styles';
import ManageColumns from 'modules/settings/properties/containers/ManageColumns';

type Props = {
  onChangeAttachment: (files: IAttachment[], contentType: string) => void;
  contentTypes: string[];
  type: string;
};

class FileUpload extends React.Component<Props, {}> {
  renderText = value => {
    switch (value) {
      case 'customer':
        return 'Customers';
      case 'company':
        return 'Companies';
      case 'deal':
        return 'Deals';
      case 'ticket':
        return 'Tickets';
      case 'task':
        return 'Tasks';
      default:
        return value;
    }
  };

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

  renderIcon = contentType => {
    switch (contentType) {
      case 'customer':
        return 'users-alt';
      case 'company':
        return 'building';
      case 'deal':
        return 'signal-alt-3';
      case 'task':
        return 'laptop';
      case 'ticket':
        return 'ticket';

      default:
        return 'users-alt';
    }
  };

  rendertContent = () => {
    const { contentTypes, onChangeAttachment } = this.props;

    return contentTypes.map(contentType => {
      const onChange = attachmentsAtt =>
        onChangeAttachment(attachmentsAtt, contentType);

      return (
        <div key={contentType} style={{ marginTop: '20px' }}>
          <UploadText>
            <p>{this.renderText(contentType)}</p>
            {this.renderColumnChooser(contentType)}
          </UploadText>

          <Uploader
            text={`Choose a file to upload your ${this.renderText(
              contentType
            )}.`}
            warningText={'Only .csv file is supported.'}
            icon={this.renderIcon(contentType)}
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
