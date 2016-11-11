import React, { PropTypes } from 'react';
import moment from 'moment';


const propTypes = {
  conversation: PropTypes.string.isRequired,
  _id: PropTypes.string.isRequired,
  name: PropTypes.string,
  sentAt: PropTypes.object.isRequired,
};

function Conversation({ conversation, _id, name, sentAt }) {
  return (
    <li className="erxes-conversation">
      <div className="avatar">
        <img src="https://js.driftt.com/dist/static/images/fffc763516d1f0ef650bb1ca7e76969e.svg" alt="Avatar" />
      </div>
      <div className="info">
        <div className="name">
          Ganzorig
        </div>
        <div className="date">{moment(sentAt).fromNow()}</div>
      </div>
      <div className="message">
        Hi how are you? I have a questions
      </div>
    </li>
  );
}

Conversation.propTypes = propTypes;

export default Conversation;
