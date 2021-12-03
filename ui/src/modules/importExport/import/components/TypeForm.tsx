import Icon from 'modules/common/components/Icon';
import { colors } from 'modules/common/styles';
import { BoxRoot, FullContent } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import { FlexItem, FlexPad } from 'modules/common/components/step/styles';
import React from 'react';
import styled from 'styled-components';
import { SubHeading } from 'modules/settings/styles';

const Box = styled(BoxRoot)`
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
  onChangeContentType: (value: string) => void;
  contentTypes: string[];
};

class TypeForm extends React.Component<Props> {
  renderBox(name, icon, selectedType) {
    const { contentTypes } = this.props;

    return (
      <Box
        selected={contentTypes.includes(selectedType)}
        onClick={() => this.props.onChangeContentType(selectedType)}
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
          <SubHeading>
            {__(`Select an object you would like to import`)}
          </SubHeading>

          <FullContent center={true}>
            {this.renderBox('Customer', 'users-alt', 'customer')}
            {this.renderBox('Company', 'building', 'company')}
            {this.renderBox('Deal', 'signal-alt-3', 'deal')}
            {this.renderBox('Task', 'laptop', 'task')}
            {this.renderBox('Ticket', 'ticket', 'ticket')}
          </FullContent>
        </FlexPad>
      </FlexItem>
    );
  }
}

export default TypeForm;
