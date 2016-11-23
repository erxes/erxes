import React, { PropTypes } from 'react';
import { Messenger, Launcher } from '../containers';


const propTypes = {
  isChatVisible: PropTypes.bool.isRequired,
};

function App({ isChatVisible }) {
  return (
    <div className="erxes-widget">
      {isChatVisible ? <Messenger /> : null}
      <Launcher />
    </div>
  );
}

App.propTypes = propTypes;

export default App;
