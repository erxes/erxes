import Icon from 'modules/common/components/Icon';

import { __ } from 'modules/common/utils';
import { FlexItem, FlexPad } from 'modules/common/components/step/styles';
import React from 'react';

import { Description, SubHeading } from 'modules/settings/styles';
import { Box, FullContent } from '../../styles';

type Props = {
  onChangeType: (value: string) => void;
  type: string;
};

class SettingsForm extends React.Component<Props> {
  renderBox(name, icon, selectedType) {
    const { type } = this.props;

    return (
      <Box
        selected={selectedType === type}
        onClick={() => this.props.onChangeType(selectedType)}
      >
        <Icon icon={icon} />
        <span>{__(name)}</span>
      </Box>
    );
  }

  render() {
    return (
      <FlexItem>
        <FlexPad direction="column">
          <SubHeading>{__('Select type')}</SubHeading>
          <Description>
            You can upload one file or multiple files at a time. You'll be able
            to choose how many objects you're importing later. You can upload
            one file or multiple files at a time.
          </Description>

          <FullContent center={true}>
            {this.renderBox('One file', 'file-alt', 'single')}
            {this.renderBox(
              'Multiple files with associations',
              'file-copy-alt',
              'multi'
            )}
          </FullContent>
        </FlexPad>
      </FlexItem>
    );
  }
}

export default SettingsForm;
