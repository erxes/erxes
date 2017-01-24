import React, { PropTypes } from 'react';
import Alert from 'meteor/erxes-notifier';
import classNames from 'classnames';


const propTypes = {
  conversation: PropTypes.object.isRequired,
  participated: PropTypes.bool.isRequired,
  toggleParticipate: PropTypes.func.isRequired,
};

function Participate({ toggleParticipate, conversation, participated }) {
  function toggle() {
    toggleParticipate({ conversationIds: [conversation._id] }, (error) => {
      if (error) {
        return Alert.error(error.reason || error.message || error.toString());
      }

      return Alert.success('Success');
    });
  }

  const iconClassName = classNames({
    'ion-ios-eye': participated,
    'ion-ios-eye-outline': !participated,
  });

  return (
    <a onClick={toggle} className={participated ? 'visible' : ''} tabIndex={0}>
      <i className={iconClassName} />
    </a>
  );
}

Participate.propTypes = propTypes;

export default Participate;
