import React, { PropTypes } from 'react';
import Alert from 'meteor/erxes-notifier';
import classNames from 'classnames';


const propTypes = {
  conversation: PropTypes.object.isRequired,
  starred: PropTypes.bool.isRequired,
  toggleStar: PropTypes.func.isRequired,
};

function Starrer({ conversation, starred, toggleStar }) {
  function toggle() {
    toggleStar({ starred: !starred, conversationIds: [conversation._id] }, (error) => {
      if (error) {
        Alert.error(error.reason || error.message || error.toString());
      }

      if (!starred) {
        Alert.success(
          'The conversation has been Starred and can be found from the ‘Starred’ menu in the side panel.',
        );
      }
    });
  }

  const iconClassName = classNames({
    'ion-ios-star': starred,
    'ion-ios-star-outline': !starred,
  });

  return (
    <a onClick={toggle} className={starred ? 'visible' : ''} tabIndex={0}>
      <i className={iconClassName} />
    </a>
  );
}

Starrer.propTypes = propTypes;

export default Starrer;
