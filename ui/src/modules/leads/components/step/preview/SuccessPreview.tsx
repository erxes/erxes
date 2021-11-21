import React from 'react';
import CommonPreview from './CommonPreview';

type Props = {
  thankTitle?: string;
  thankContent?: string;
  onChange: (name: any, value: string) => void;
  type?: string;
  color: string;
  theme: string;
  successImgSize?: string;
  successImage?: string;
};

class SuccessPreview extends React.Component<Props, {}> {
  render() {
    const {
      theme,
      color,
      thankTitle,
      thankContent,
      type,
      successImage,
      successImgSize
    } = this.props;

    return (
      <CommonPreview
        title={thankTitle}
        theme={theme}
        color={color}
        type={type}
        image={successImage}
        imgSize={successImgSize}
        bodyValue={thankContent}
      />
    );
  }
}

export default SuccessPreview;
