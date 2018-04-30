import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CommonPreview from './CommonPreview';
import { ThankContent } from '../style';

const propTypes = {
  thankContent: PropTypes.string,
  onChange: PropTypes.func,
  type: PropTypes.string
};

class SuccessPreview extends Component {
  render() {
    const { thankContent, type } = this.props;

    return (
      <CommonPreview btnText="Cancel" btnStyle="link" theme="" type={type}>
        <ThankContent>{thankContent}</ThankContent>
      </CommonPreview>
    );
  }
}

SuccessPreview.propTypes = propTypes;

export default SuccessPreview;
