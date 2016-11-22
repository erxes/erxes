import React, { PropTypes } from 'react';
import Chat from '../containers/Chat';
import HelpButton from '../containers/HelpButton';


const propTypes = {
  isChatVisible: PropTypes.bool.isRequired,
};

function App({ isChatVisible }) {
  return (
    <div>
      {isChatVisible ? <Chat /> : null}
      <HelpButton />
    </div>
  );
}

App.propTypes = propTypes;

export default App;
