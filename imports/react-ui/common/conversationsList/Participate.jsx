import React, { PropTypes } from 'react';
import classNames from 'classnames';


const propTypes = {
  participated: PropTypes.bool.isRequired,
};

function Participate({ participated }) {
  const iconClassName = classNames({
    'ion-ios-eye': participated,
    'ion-ios-eye-outline': !participated,
  });

  return (
    <a className={participated ? 'visible' : ''} tabIndex={0}>
      <i className={iconClassName} />
    </a>
  );
}

Participate.propTypes = propTypes;

export default Participate;
