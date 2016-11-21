import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Chat } from '../actions';


const propTypes = {
  dispatch: PropTypes.func.isRequired,
  message: PropTypes.string.isRequired,
  _id: PropTypes.string.isRequired,
};

function Retry({ dispatch, message, _id }) {
  function onClick(e) {
    e.preventDefault();

    if (!message.trim()) {
      return;
    }

    dispatch(Chat.sendMessage(message, _id));
  }

  return (
    <div>
      <button className="btn-resend" onClick={onClick}>Resend</button>
    </div>
  );
}

Retry.propTypes = propTypes;

export default connect()(Retry);
