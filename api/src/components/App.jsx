import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Chat from '../containers/Chat';
import HelpButton from '../containers/HelpButton';


const propTypes = {
  isChatVisible: PropTypes.bool.isRequired,
};

function App({ isChatVisible }) {
  const { email = '' } = global.erxesSettings || {};

  return (
    <div>
      {isChatVisible ? <Chat email={email} /> : null}
      <HelpButton isVisible={isChatVisible} email={email} />
    </div>
  );
}

App.propTypes = propTypes;

const mapStateToProps = state => ({
  isChatVisible: state.chat.isVisible,
});

export default connect(mapStateToProps)(App);
