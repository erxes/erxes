import React from 'react';
import PropTypes from 'prop-types';

export default class TranslationWrapper extends React.Component {
  getChildContext() {
    const { intl } = this.props;
    const { formatMessage } = intl;

    return {
      __: formatMessage
    };
  }

  render() {
    return this.props.children;
  }
}

TranslationWrapper.propTypes = {
  intl: PropTypes.object,
  children: PropTypes.object
};

TranslationWrapper.childContextTypes = {
  __: PropTypes.func
};
