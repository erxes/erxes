import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CommonPreview from './CommonPreview';

const propTypes = {
  calloutTitle: PropTypes.string,
  bodyValue: PropTypes.string,
  calloutBtnText: PropTypes.string,
  color: PropTypes.string,
  theme: PropTypes.string,
  image: PropTypes.string,
  onChange: PropTypes.func,
  type: PropTypes.string
};

class CalloutPreview extends Component {
  render() {
    const {
      calloutTitle,
      bodyValue,
      calloutBtnText,
      color,
      theme,
      image,
      type
    } = this.props;

    return (
      <CommonPreview
        title={calloutTitle}
        theme={theme}
        color={color}
        btnText={calloutBtnText}
        image={image}
        btnStyle="primary"
        bodyValue={bodyValue}
        type={type}
      />
    );
  }
}

CalloutPreview.propTypes = propTypes;

export default CalloutPreview;
