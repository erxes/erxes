import React from 'react';
import { ControlLabel, Uploader, __ } from 'erxes-ui';
import { FlexItem, FlexPad } from 'modules/common/components/step/styles';
import { IAttachment } from 'modules/common/types';
import { Description, SubHeading } from 'modules/settings/styles';

type Props = {
  onChangeAttachment: (files: IAttachment[], contentType: string) => void;
  contentTypes: string[];
  type: string;
};

class FileUpload extends React.Component<Props, {}> {
  rendertContent = () => {
    const { contentTypes, onChangeAttachment } = this.props;

    return contentTypes.map(contentType => {
      const onChange = attachmentsAtt =>
        onChangeAttachment(attachmentsAtt, contentType);

      return (
        <div key={contentType} style={{ marginTop: '20px' }}>
          <ControlLabel>{contentType}</ControlLabel>

          <Uploader single={true} defaultFileList={[]} onChange={onChange} />
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

          {this.rendertContent()}
        </FlexPad>
      </FlexItem>
    );
  }
}

export default FileUpload;
