import React from 'react';
import CommonPreview from './CommonPreview';

type Props = {
  calloutTitle?: string;
  bodyValue?: string;
  calloutBtnText?: string;
  color?: string;
  theme?: string;
  image?: string;
  type?: string;
  calloutImgSize?: string;
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
      type,
      calloutImgSize
    } = this.props;

    return (
      <CommonPreview
        title={calloutTitle}
        theme={theme}
        color={color}
        btnText={calloutBtnText}
        image={image}
        imgSize={calloutImgSize}
        btnStyle="primary"
        bodyValue={bodyValue}
        type={type}
      />
    );
  }
}

export default CalloutPreview;
