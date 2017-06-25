import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { Messenger, Launcher, Notifier, VisitorLauncher, VisitorForm } from '../containers';

function App({ isMessengerVisible, isEmailReceived, color }) {
  const widgetClasses = classNames('erxes-widget', { opened: isMessengerVisible });

  if (isEmailReceived) {
    return (
      <div className={widgetClasses}>
        { isMessengerVisible ? null : <Notifier /> }

        <Messenger />
        <Launcher color={color} />
      </div>
    );
  }

  return (
    <div className={widgetClasses}>
      <VisitorForm color={color} />
      <VisitorLauncher color={color} />
    </div>
  );
}

App.propTypes = {
  isMessengerVisible: PropTypes.bool.isRequired,
  isEmailReceived: PropTypes.bool.isRequired,
  color: PropTypes.string,
};

App.defaultProps = {
  color: null,
};

export default App;
