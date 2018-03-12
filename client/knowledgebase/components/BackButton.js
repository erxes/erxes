import React from 'react';
import PropTypes from 'prop-types';
import Ionicons from 'react-ionicons';

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
      <Ionicons icon="ion-chevron-left" fontSize="10px" color="#888" />
      {__(text)}
    </button>
  );
}

BackButton.propTypes = propTypes;
BackButton.contextTypes = contextTypes;

export default BackButton;
