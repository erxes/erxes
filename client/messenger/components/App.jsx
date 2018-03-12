import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Messenger, Launcher, Notifier } from '../containers';

function App({ isMessengerVisible, uiOptions }) {
  const widgetClasses = classNames('erxes-widget', { opened: isMessengerVisible });

  return (
    <div className={widgetClasses}>
      { isMessengerVisible ? null : <Notifier /> }

      <Messenger />
      <Launcher uiOptions={uiOptions} />
    </div>
  );
}

App.propTypes = {
  isMessengerVisible: PropTypes.bool.isRequired,
  uiOptions: PropTypes.object,
};

App.defaultProps = {
  uiOptions: null,
};

export default App;
