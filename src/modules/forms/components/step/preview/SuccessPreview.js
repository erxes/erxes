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
    const { thankContent, type, color, theme } = this.props;

    return (
      <CommonPreview
        btnText="Cancel"
        btnStyle="link"
        type={type}
        theme={theme}
        color={color}
      >
        <ThankContent>{thankContent}</ThankContent>
      </CommonPreview>
    );
  }
}

SuccessPreview.propTypes = propTypes;

export default SuccessPreview;
