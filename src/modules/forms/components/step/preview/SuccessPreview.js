import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CommonPreview from './CommonPreview';
import { ThankContent } from './styles';

const propTypes = {
  thankContent: PropTypes.string,
  onChange: PropTypes.func,
  type: PropTypes.string,
  color: PropTypes.string,
  theme: PropTypes.string
};

class SuccessPreview extends Component {
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

SuccessPreview.propTypes = propTypes;

export default SuccessPreview;
