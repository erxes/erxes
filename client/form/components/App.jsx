import React, { PropTypes } from 'react';
import { Form, ShoutboxLauncher } from '../containers';


const propTypes = {
  isShoutboxFormVisible: PropTypes.bool.isRequired,
  loadType: PropTypes.string.isRequired,
  onModalClose: PropTypes.func,
};

function App({ isShoutboxFormVisible, loadType, onModalClose }) {
  if (loadType === 'shoutbox') {
    return (
      <div className="shoutbox-form">
        { isShoutboxFormVisible ? <Form /> : null }

        <ShoutboxLauncher />
      </div>
    );
  }

  if (loadType === 'embedded') {
    return <Form />;
  }

  if (loadType === 'modal') {
    return (
      <div className="modal-form">
        <div className="close" onClick={onModalClose} />
        <Form />
      </div>
    );
  }

  return null;
}

App.propTypes = propTypes;

export default App;
