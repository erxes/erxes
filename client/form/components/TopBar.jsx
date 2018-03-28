import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  color: PropTypes.string,
  title: PropTypes.string
};

const contextTypes = {
  __: PropTypes.func
};

function TopBar({ title, color }, {__}) {


  return (
    <div className="erxes-topbar thiner" style={{ backgroundColor: color }}>
      <div className="erxes-middle">
        <div className="erxes-topbar-title">
          <div>{title}</div>
        </div>
      </div>
    </div>
  );
}

TopBar.propTypes = propTypes;
TopBar.contextTypes = contextTypes;

TopBar.defaultProps = {
  title: null,
  color: null,
};

export default TopBar;
