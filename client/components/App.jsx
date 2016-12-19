import React, { PropTypes } from 'react';
import { Messenger, Launcher } from '../containers';


const propTypes = {
  isMessengerVisible: PropTypes.bool.isRequired,
};

function App({ isMessengerVisible }) {
  return (
    <div className="erxes-widget">
      {isMessengerVisible ? <Messenger /> : null}
      <Launcher />
    </div>
  );
}

App.propTypes = propTypes;

export default App;
