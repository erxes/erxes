import React from 'react';
import PropTypes from 'prop-types';
import Ionicons from 'react-ionicons';

const propTypes = {
  onClickHandler: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
};

function BackButton({ onClickHandler, text }) {
  return (
    <button onClick={onClickHandler} className="back">
      <Ionicons icon="ion-chevron-left" fontSize="10px" color="#888" />
      {text}
    </button>
  );
}

BackButton.propTypes = propTypes;

export default BackButton;
