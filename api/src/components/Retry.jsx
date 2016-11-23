import React, { PropTypes } from 'react';


const propTypes = {
  sendMessage: PropTypes.func.isRequired,
  message: PropTypes.string.isRequired,
};

function Retry({ sendMessage, message }) {
  function onClick(e) {
    e.preventDefault();
    sendMessage(message);
  }

  return (
    <div>
      <button className="btn-resend" onClick={onClick}>
        Resend
      </button>
    </div>
  );
}

Retry.propTypes = propTypes;

export default Retry;
