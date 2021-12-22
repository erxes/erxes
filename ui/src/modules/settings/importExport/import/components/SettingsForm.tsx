import Icon from 'modules/common/components/Icon';
import { colors } from 'modules/common/styles';
import { BoxRoot, FullContent } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import { FlexItem, FlexPad } from 'modules/common/components/step/styles';
import React from 'react';
import styled from 'styled-components';
import { Description, SubHeading } from 'modules/settings/styles';

const Box = styled(BoxRoot)`
  height: 180px;
  width: 200px;
  padding: 40px;
  background: ${colors.bgLight};

  i {
    font-size: 38px;
    color: ${colors.colorSecondary};
  }

  span {
    font-weight: 500;
    text-transform: capitalize;
  }

  p {
    margin: 10px 0 0;
    font-size: 12px;
    color: ${colors.colorCoreLightGray};
    min-height: 36px;
  }

  &:last-of-type {
    margin-right: 0;
  }
`;

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
            to choose how many objects you're importing later.
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
