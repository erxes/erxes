import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  onClickHandler: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired
};

const contextTypes = {
  __: PropTypes.func
}

function BackButton({ onClickHandler, text }, {__}) {
  return (
    <button onClick={onClickHandler} className="back">
      <i className="icon-leftarrow-2" />
      {__(text)}
    </button>
  );
}

BackButton.propTypes = propTypes;
BackButton.contextTypes = contextTypes;

export default BackButton;
