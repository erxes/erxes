import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Messenger, Launcher, Notifier } from '../containers';

function App({ isMessengerVisible, isBrowserInfoSaved, uiOptions }) {
  const widgetClasses = classNames('erxes-widget', { opened: isMessengerVisible });

  const renderNotifier = () => {
    if (isMessengerVisible) {
      return null;
    }

    if (!isBrowserInfoSaved) {
      return null;
    }

    return <Notifier />
  }

  return (
    <div className={widgetClasses}>
      {renderNotifier()}
      <Messenger />
      <Launcher uiOptions={uiOptions} />
    </div>
  );
}

App.propTypes = {
  isMessengerVisible: PropTypes.bool.isRequired,
  isBrowserInfoSaved: PropTypes.bool,
  uiOptions: PropTypes.object,
};

App.defaultProps = {
  uiOptions: null,
};

export default App;
