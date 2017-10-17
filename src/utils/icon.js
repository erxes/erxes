import React from 'react';
import PropTypes from 'prop-types';
import Ionicon from 'react-ionicons';

const types = {
  icon: PropTypes.string.isRequired,
  className: PropTypes.string,
};

class Icon extends React.Component {
  render() {
    const props = this.props;
    const { className } = props;

    const attr = {
      className: Utils.classNames(`ion-${props.icon}`, className),
    };

    return  <Ionicon {...attr}/> 
  }
}

export default Icon;
