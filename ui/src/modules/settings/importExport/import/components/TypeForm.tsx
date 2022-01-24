import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import { FlexItem, FlexPad } from 'modules/common/components/step/styles';
import React from 'react';
import { SubHeading } from 'modules/settings/styles';
import { Box, TypeContent } from '../../styles';

type Props = {
  onChangeContentType: (value: string) => void;
  contentTypes: string[];
  type: string;
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

  renderText = () => {
    const { type } = this.props;

    if (type === 'single') {
      return 'Select an object you would like to import';
    }

    return 'Select an two  objects you would like to import';
  };

  render() {
    return (
      <FlexItem>
        <FlexPad direction="column">
          <SubHeading>{__(this.renderText())}</SubHeading>

          <TypeContent center={true}>
            {this.renderBox('Customer', 'users-alt', 'customer')}
            {this.renderBox('Lead', 'file-alt', 'lead')}
            {this.renderBox('Company', 'building', 'company')}
            {this.renderBox('Deal', 'signal-alt-3', 'deal')}
            {this.renderBox('Task', 'laptop', 'task')}
            {this.renderBox('Ticket', 'ticket', 'ticket')}
          </TypeContent>
        </FlexPad>
      </FlexItem>
    );
  }
}

export default TypeForm;
