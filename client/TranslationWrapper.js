import React from 'react';
import PropTypes from 'prop-types';
import T from 'i18n-react';

class TranslationWrapper extends React.Component {
  getChildContext() {
    return {
      __: (msg) => T.translate(msg),
    };
  }

  render() {
    return this.props.children;
  }
}

TranslationWrapper.propTypes = {
  children: PropTypes.object,
};

TranslationWrapper.childContextTypes = {
  __: PropTypes.func,
};

export default TranslationWrapper;
