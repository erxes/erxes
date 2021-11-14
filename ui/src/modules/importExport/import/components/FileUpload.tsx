import React from 'react';
import { Uploader, __ } from 'erxes-ui';
import { FlexItem, FlexPad } from 'modules/common/components/step/styles';
import { IAttachment } from 'modules/common/types';
import { Description, SubHeading } from 'modules/settings/styles';

type Props = {
  onChangeAttachment: (files: IAttachment[]) => void;
};

class FileUpload extends React.Component<Props, {}> {
  render() {
    const { onChangeAttachment } = this.props;

    return (
      <FlexItem>
        <FlexPad direction="column" overflow="auto">
          <SubHeading>{__('Upload your file')}</SubHeading>
          <Description>
            {__(
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam facilisis leo leo, ut porttitor lorem suscipit ac. Mauris commodo consectetur finibus. Nullam id facilisis ante.'
            )}
          </Description>

          <Uploader
            single={true}
            defaultFileList={[]}
            onChange={onChangeAttachment}
          />
        </FlexPad>
      </FlexItem>
    );
  }
}

export default FileUpload;
