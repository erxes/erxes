import React from 'react';
import CommonPreview from './CommonPreview';
import { ThankContent } from './styles';

type Props = {
  thankTitle?: string;
  thankContent?: string;
  onChange: (name: any, value: string) => void;
  type?: string;
  color: string;
  theme: string;
};

class SuccessPreview extends React.Component<Props, {}> {
  render() {
    const { theme, color, thankTitle, thankContent, type } = this.props;

    return (
      <CommonPreview title={thankTitle} theme={theme} color={color} type={type}>
        <ThankContent>{thankContent}</ThankContent>
      </CommonPreview>
    );
  }
}

export default SuccessPreview;
