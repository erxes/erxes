import React from 'react';
import PropTypes from 'prop-types';

import { Notifier as DumbNotifier } from '../components';
import { AppConsumer } from './AppContext';

export default class Notifier extends React.Component {
  render() {
    const { message } = this.props;

    if (!message || !message._id) {
      return null;
    }

    return (
      <AppConsumer>
        {({ readConversation, toggleNotifierFull, toggleNotifier }) => {
          const showUnreadMessage = () => {
            if (message._id) {
              const engageData = message.engageData;

              if (engageData && engageData.sentAs === 'fullMessage') {
                toggleNotifierFull();
              } else {
                toggleNotifier();
              }
            }
          }

          return (
            <DumbNotifier
              {...this.props}
              message={message}
              readConversation={readConversation}
              showUnreadMessage={showUnreadMessage}
            />
          );
        }}
      </AppConsumer>
    );
  }
}

Notifier.propTypes = {
  message: PropTypes.object,
}
