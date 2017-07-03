import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { Messenger, Launcher, Notifier } from '../containers';

function App({ isMessengerVisible, color }) {
  const widgetClasses = classNames('erxes-widget', { opened: isMessengerVisible });

  return (
    <div className={widgetClasses}>
      { isMessengerVisible ? null : <Notifier /> }

      <Messenger />
      <Launcher color={color} />
    </div>
  );
}

App.propTypes = {
  isMessengerVisible: PropTypes.bool.isRequired,
  color: PropTypes.string,
};

App.defaultProps = {
  color: null,
};

export default App;
