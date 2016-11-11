import React, { PropTypes } from 'react';
import Alert from 'meteor/erxes-notifier';


const propTypes = {
  ticket: PropTypes.object.isRequired,
  starred: PropTypes.bool.isRequired,
  toggleStar: PropTypes.func.isRequired,
};

function Starrer({ ticket, starred, toggleStar }) {
  function toggle() {
    toggleStar({ starred: !starred, ticketIds: [ticket._id] }, error => {
      if (error) {
        Alert.error('Error', error.reason || error.message || error.toString());
      }
    });
  }

  return (
    <i
      className={`ticket-starrer ion-ios-star${starred ? '' : '-outline'}`}
      onClick={toggle}
    />
  );
}

Starrer.propTypes = propTypes;

export default Starrer;
