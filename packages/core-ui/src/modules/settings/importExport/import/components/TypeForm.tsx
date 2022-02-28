import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import { FlexItem, FlexPad } from 'modules/common/components/step/styles';
import React from 'react';
import { Box, TypeContent } from '../../styles';
import { IImportHistoryContentType } from '../../types';
import { SubHeading } from '@erxes/ui-settings/src/styles';

type Props = {
  onChangeContentType: (value: IImportHistoryContentType) => void;
  contentTypes: IImportHistoryContentType[];
  type: string;
  typeOptions: any[];
};

class TypeForm extends React.Component<Props> {
  renderSelected = selectedType => {
    const { contentTypes } = this.props;

    if (contentTypes.length > 0) {
      const contentType = contentTypes[0].contentType;

      return contentType === selectedType.contentType ? true : false;
    }

    return false;
  };

  renderBox(name, icon, selectedType) {
    return (
      <Box
        key={Math.random()}
        selected={this.renderSelected(selectedType)}
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

  renderOptions = () => {
    const { typeOptions } = this.props;

    return typeOptions.map(option => {
      return this.renderBox(option.text, option.icon, option);
    });
  };

  render() {
    return (
      <FlexItem>
        <FlexPad direction="column">
          <SubHeading>{__(this.renderText())}</SubHeading>

          <TypeContent center={true}>{this.renderOptions()}</TypeContent>
        </FlexPad>
      </FlexItem>
    );
  }
}

export default TypeForm;
