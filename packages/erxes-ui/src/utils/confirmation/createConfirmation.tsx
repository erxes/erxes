import React from 'react';
import ReactDOM from 'react-dom';
import ConfirmDialog from '@erxes/ui/src/components/ConfirmDialog';
import { createRoot } from 'react-dom/client';

const createConfirmation = (unmountDelay = 1000) => {
  return (props) => {
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

    const promise = new Promise((proceed) => {
      try {
        createRoot(wrapper).render(
          <ConfirmDialog proceed={proceed} dismiss={dismiss} {...props} />,
        );
      } catch (e) {
        throw e;
      }
    });

    return promise.then((value) => {
      dismiss();
      return value;
    });
  };
};

export default createConfirmation;
