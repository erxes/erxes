import React, { PropTypes } from 'react';
import { Messenger, Launcher, VisitorLauncher, VisitorForm } from '../containers';

function App({ isMessengerVisible, isEmailReceived, color }) {
  if (isEmailReceived) {
    return (
      <div className="erxes-widget">
        {isMessengerVisible ? <Messenger /> : null}
        <Launcher color={color} />
      </div>
    );
  }

  return (
    <div className="erxes-widget">
      { isMessengerVisible ? <VisitorForm color={color} /> : null }
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
