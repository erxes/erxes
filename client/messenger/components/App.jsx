import React, { PropTypes } from 'react';
import { Messenger, Launcher, VisitorLauncher, VisitorForm } from '../containers';


const propTypes = {
  isMessengerVisible: PropTypes.bool.isRequired,
  isEmailReceived: PropTypes.bool.isRequired,
};

function App({ isMessengerVisible, isEmailReceived }) {
  if (isEmailReceived) {
    return (
      <div className="erxes-widget">
        {isMessengerVisible ? <Messenger /> : null}
        <Launcher />
      </div>
    );
  }

  return (
    <div className="erxes-widget">
      { isMessengerVisible ? <VisitorForm /> : null }
      <VisitorLauncher />
    </div>
  );
}

App.propTypes = propTypes;

export default App;
