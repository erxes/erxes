import React from 'react';
import { CommonPreview } from './';

type Props = {
  calloutTitle?: string;
  bodyValue?: string;
  calloutBtnText?: string;
  color?: string;
  theme?: string;
  image?: string;
  type?: string;
};

class CalloutPreview extends React.Component<Props, {}> {
  render() {
    const {
      calloutTitle,
      bodyValue,
      calloutBtnText,
      color,
      theme,
      image,
      type
    } = this.props;

    return (
      <CommonPreview
        title={calloutTitle}
        theme={theme}
        color={color}
        btnText={calloutBtnText}
        image={image}
        btnStyle="primary"
        bodyValue={bodyValue}
        type={type}
      />
    );
  }
}

export default CalloutPreview;
