import React from 'react';
import { keyframes } from 'styled-components';
import CommonPreview from './CommonPreview';
import { DropdownContent, CenterContainer } from '../style';

const sliderTop = keyframes`
  0% {
    opacity: 0.7;
    height: 0px;
  }
  100% {
    opacity: 1;
    height: auto;
  }
`;

const Container = CenterContainer.extend`
  align-items: inherit;
  display: block;
`;

const Dropdown = DropdownContent.extend`
  animation: ${sliderTop} 0.5s linear;
  position: relative;
  transition: all 0.2s linear;
  flex: inherit;
`;

class DropdownPreview extends CommonPreview {
  render() {
    return (
      <Container>
        <Dropdown>{this.renderContent()}</Dropdown>
      </Container>
    );
  }
}

export default DropdownPreview;
