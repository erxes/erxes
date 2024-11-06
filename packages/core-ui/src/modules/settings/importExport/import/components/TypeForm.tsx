import { Box, ImportHeader, TypeContent } from "../../styles";

import { FlexPad } from "modules/common/components/step/styles";
import { IContentType } from "../../types";
import Icon from "modules/common/components/Icon";
import React from "react";
import { __ } from "modules/common/utils";

type Props = {
  onChangeContentType: (value: IContentType) => void;
  contentType: string;
  contentTypes: IContentType[];
  type: string;
  typeOptions: IContentType[];
};

class TypeForm extends React.Component<Props> {
  componentDidMount() {
    const { contentType, typeOptions, onChangeContentType } = this.props;
    const type = typeOptions.find((t) => t.contentType === contentType);

    if (type) {
      onChangeContentType(type);
    }
  }

  renderSelected = (selectedType) => {
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
        $selected={this.renderSelected(selectedType)}
        onClick={() => this.props.onChangeContentType(selectedType)}
      >
        <Icon icon={icon} />
        <span>{__(name)}</span>
      </Box>
    );
  }

  renderText = () => {
    const { type } = this.props;

    if (type === "single") {
      return "Select an object you would like to import";
    }

    return "Select an two  objects you would like to import";
  };

  renderOptions = () => {
    const { typeOptions } = this.props;

    return typeOptions.map((option) => {
      return this.renderBox(option.text, option.icon, option);
    });
  };

  render() {
    return (
      <FlexPad type="stepper" direction="column">
        <ImportHeader>{__(this.renderText())}</ImportHeader>

        <TypeContent $center={true}>{this.renderOptions()}</TypeContent>
      </FlexPad>
    );
  }
}

export default TypeForm;
