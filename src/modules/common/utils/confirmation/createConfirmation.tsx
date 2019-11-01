import React from 'react';
import ReactDOM from 'react-dom';
import ConfirmDialog from '../../components/ConfirmDialog';

const createConfirmation = (unmountDelay = 1000) => {
  return props => {
    const wrapper = document.body.appendChild(document.createElement('div'));

    function dismiss() {
      if (props.options.beforeDismiss) {
        props.options.beforeDismiss();
      }

      setTimeout(() => {
        ReactDOM.unmountComponentAtNode(wrapper);
        wrapper.remove();
      }, unmountDelay);
    }

    const promise = new Promise(proceed => {
      try {
        ReactDOM.render(
          <ConfirmDialog proceed={proceed} dismiss={dismiss} {...props} />,
          wrapper
        );
      } catch (e) {
        throw e;
      }
    });

    return promise.then(() => {
      dismiss();
      return;
    });
  };
};

export default createConfirmation;
