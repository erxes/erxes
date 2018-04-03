import React from 'react';
import CommonPreview from './CommonPreview';
import { CenterContainer, FormContainer, OverlayTrigger } from '../style';

class PopupPreview extends CommonPreview {
  render() {
    return (
      <CenterContainer>
        <OverlayTrigger />
        <FormContainer>{this.renderContent()}</FormContainer>
      </CenterContainer>
    );
  }
}

export default PopupPreview;
