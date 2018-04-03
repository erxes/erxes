import React from 'react';
import { keyframes } from 'styled-components';
import CommonPreview from './CommonPreview';
import { CenterContainer, SlideLeftContent } from '../style';

const sliderRight = keyframes`
  0% {
    transform: translateX(20px);
    opacity: 0.7;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
`;

const SlideRightContent = SlideLeftContent.extend`
  right: 0;
  left: auto;
`;

const SlideRight = SlideRightContent.extend`
  animation: ${sliderRight} 0.5s linear;
  box-shadow: -3px 0px 5px rgba(0, 0, 0, 0.25);
`;

class SlideRightPreview extends CommonPreview {
  render() {
    const { preview } = this.props;

    return (
      <CenterContainer data={preview}>
        <SlideRight>{this.renderContent()}</SlideRight>
      </CenterContainer>
    );
  }
}

export default SlideRightPreview;
