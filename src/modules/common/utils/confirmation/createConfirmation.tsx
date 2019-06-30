import * as React from 'react';
import * as ReactDOM from 'react-dom';
import ConfirmDialog from '../../components/ConfirmDialog';

const createConfirmation = (unmountDelay = 1000) => {
  return props => {
    const wrapper = document.body.appendChild(document.createElement('div'));

    function dismiss() {
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
