import React, { PropTypes } from 'react';
import Alert from 'meteor/erxes-notifier';


const propTypes = {
  conversation: PropTypes.object.isRequired,
  starred: PropTypes.bool.isRequired,
  toggleStar: PropTypes.func.isRequired,
};

function Starrer({ conversation, starred, toggleStar }) {
  function toggle() {
    toggleStar({ starred: !starred, conversationIds: [conversation._id] }, error => {
      if (error) {
        Alert.error('Error', error.reason || error.message || error.toString());
      }
    });
  }

  return (
    <i
      className={`conversation-starrer ion-ios-star${starred ? '' : '-outline'}`}
      onClick={toggle}
    />
  );
}

Starrer.propTypes = propTypes;

export default Starrer;
