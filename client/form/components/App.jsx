import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { iconClose } from '../../icons/Icons';
import { Form, ShoutboxLauncher } from '../containers';


const propTypes = {
  isShoutboxFormVisible: PropTypes.bool.isRequired,
  loadType: PropTypes.string.isRequired,
  onModalClose: PropTypes.func,
  uiOptions: PropTypes.object,
};

function App({ isShoutboxFormVisible, loadType, onModalClose, uiOptions }) {
  const widgetClasses = classNames('shoutbox-form', { opened: isShoutboxFormVisible });
  
  if (loadType === 'shoutbox') {
    return (
      <div className={widgetClasses}>
        <Form />
        <ShoutboxLauncher color={uiOptions.themeColor} />
      </div>
    );
  }

  if (loadType === 'embedded') {
    return <Form />;
  }

  if (loadType === 'popup') {
    return (
      <div className="modal-form">
        <a
          href=""
          className="close"
          onClick={onModalClose}
          title="Close"
        >
          {iconClose}
        </a>
        <Form />
      </div>
    );
  }

  return null;
}

App.propTypes = propTypes;

export default App;
