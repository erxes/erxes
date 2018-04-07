import React from 'react';
import PropTypes from 'prop-types';
import CommonPreview from './CommonPreview';
import { CenterContainer, FormContainer, OverlayTrigger } from '../style';

const propTypes = {
  preview: PropTypes.string
};

class PopupPreview extends CommonPreview {
  render() {
    const { preview } = this.props;

    return (
      <CenterContainer data={preview}>
        <OverlayTrigger />
        <FormContainer>{this.renderContent()}</FormContainer>
      </CenterContainer>
    );
  }
}

PopupPreview.propTypes = propTypes;

export default PopupPreview;
