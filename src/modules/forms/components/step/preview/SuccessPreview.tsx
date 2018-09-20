import React, { Component } from "react";
import CommonPreview from "./CommonPreview";
import { ThankContent } from "./styles";

type Props = {
  thankContent?: string;
  onChange: (name: string, value: string) => void;
  type?: string;
  color: string;
  theme: string;
};

class SuccessPreview extends Component<Props, {}> {
  render() {
    const { theme, color, thankContent, type } = this.props;

    return (
      <CommonPreview
        title={thankContent}
        theme={theme}
        color={color}
        type={type}
      >
        <ThankContent>{thankContent}</ThankContent>
      </CommonPreview>
    );
  }
}

export default SuccessPreview;
