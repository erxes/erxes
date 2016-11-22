import React, { PropTypes } from 'react';
import { Chat, HelpButton } from '../containers';


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
