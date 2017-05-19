import React, { PropTypes } from 'react';
import { Messenger, Launcher, VisitorLauncher, VisitorForm } from '../containers';


const propTypes = {
  isMessengerVisible: PropTypes.bool.isRequired,
  isEmailReceived: PropTypes.bool.isRequired,
  color: PropTypes.string.isRequired,
};

function App({ isMessengerVisible, isEmailReceived, color }) {
  if (isEmailReceived) {
    return (
      <div className="erxes-widget">
        {isMessengerVisible ? <Messenger color={color} /> : null}
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

App.propTypes = propTypes;

export default App;
