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
      <div className="erxes-shoutbox-form">
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
      <div>
        <button onClick={onModalClose}>close</button>
        <Form />
      </div>
    );
  }

  return null;
}

App.propTypes = propTypes;

export default App;
