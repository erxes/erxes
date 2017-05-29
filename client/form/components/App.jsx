import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { Form, ShoutboxLauncher } from '../containers';


const propTypes = {
  isShoutboxFormVisible: PropTypes.bool.isRequired,
  loadType: PropTypes.string.isRequired,
  onModalClose: PropTypes.func,
};

function App({ isShoutboxFormVisible, loadType, onModalClose }) {
  const widgetClasses = classNames('shoutbox-form', { opened: isShoutboxFormVisible });
  if (loadType === 'shoutbox') {
    return (
      <div className={widgetClasses}>
        <Form />
        <ShoutboxLauncher />
      </div>
    );
  }

  if (loadType === 'embedded') {
    return <Form />;
  }

  if (loadType === 'popup') {
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
