import React from 'react';
import { keyframes } from 'styled-components';
import CommonPreview from './CommonPreview';
import { SlideLeftContent, CenterContainer } from '../style';

const sliderleft = keyframes`
  0% {
    transform: translateX(-20px);
    opacity: 0.7;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
`;

const SlideLeft = SlideLeftContent.extend`
  animation: ${sliderleft} 0.5s linear;
`;

class SlideLeftPreview extends CommonPreview {
  render() {
    return (
      <CenterContainer>
        <SlideLeft>{this.renderContent()}</SlideLeft>
      </CenterContainer>
    );
  }
}

export default SlideLeftPreview;
