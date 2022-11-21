import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import { FlexPad } from 'modules/common/components/step/styles';
import React from 'react';
import { Box, TypeContent, ImportHeader } from '../../styles';

type Props = {
  onChangeContentType: (contentType: string, skipFilter: boolean) => void;
  contentType: string;
  typeOptions: any[];
};

class TypeForm extends React.Component<Props> {
  componentDidMount() {
    const { contentType, typeOptions, onChangeContentType } = this.props;
    const type = typeOptions.find(t => t.contentType === contentType);

    if (type) {
      onChangeContentType(contentType, type.skipFilter);
    }
  }

  renderBox(
    name: string,
    icon: string,
    contentType: string,
    skipFilter: boolean
  ) {
    return (
      <Box
        key={Math.random()}
        selected={this.props.contentType === contentType}
        onClick={() => this.props.onChangeContentType(contentType, skipFilter)}
      >
        <Icon icon={icon} />
        <span>{__(name)}</span>
      </Box>
    );
  }

  renderOptions = () => {
    const { typeOptions } = this.props;

    return typeOptions.map(option => {
      return this.renderBox(
        option.text,
        option.icon,
        option.contentType,
        option.skipFilter
      );
    });
  };

  render() {
    return (
      <FlexPad type="stepper" direction="column">
        <ImportHeader>
          {__('Select an object you would like to export')}
        </ImportHeader>

        <TypeContent center={true}>{this.renderOptions()}</TypeContent>
      </FlexPad>
    );
  }
}

export default TypeForm;
