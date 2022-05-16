import T from 'i18n-react';
import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import AlertStyled from './Alert';

const AlertsWrapper = styled.div.attrs({
  id: 'alerts-wrapper'
})`
  position: fixed;
  display: flex;
  flex-direction: column;
  align-items: center;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: auto;
  background: transparent;
  z-index: 5080;
  font-size: 14px;
`;

const createAlert = (type: string, text: string, time?: number) => {
  if (!document.getElementById('alert-container')) {
    const alertContainer = document.createElement('div');

    alertContainer.setAttribute('id', 'alert-container');

    document.body.appendChild(alertContainer);

    ReactDOM.render(<AlertsWrapper />, alertContainer);
  }

  const alertsWrapper = document.getElementById(`alerts-wrapper`);

  const timeout = setTimeout(() => {
    const lastChild = alertsWrapper ? alertsWrapper.lastChild : null;

    if (!lastChild) {
      const alertContainer = document.getElementById('alert-container');

      if (alertContainer) {
        alertContainer.remove();
      }

      clearTimeout(timeout);

      return;
    }

    lastChild.remove();
  }, time || 3500);

  const alertcount = alertsWrapper ? alertsWrapper.childElementCount : 0;

  if (!document.getElementById(`alert-container-${alertcount}`)) {
    const alertContainer = document.createElement('div');

    if (alertContainer && alertsWrapper) {
      alertsWrapper.appendChild(alertContainer);
    }

    alertContainer.setAttribute('id', `alert-container-${alertcount}`);

    const deleteNode = (index: number) => {
      const container = document.getElementById(`alert-container-${index}`);

      if (container) {
        container.remove();
      }
    };

    ReactDOM.render(
      <AlertStyled
        key={alertcount}
        index={alertcount}
        deleteNode={deleteNode}
        type={type}
      >
        {T.translate(text)}
      </AlertStyled>,
      alertContainer
    );
  }
};

const success = (text: string, time?: number) =>
  createAlert('success', text, time);

const error = (text: string, time?: number) => {
  if (text) {
    createAlert('error', text.replace('GraphQL error:', ''), time);
  }
};

const warning = (text: string, time?: number) =>
  createAlert('warning', text, time);

const info = (text: string, time?: number) => createAlert('info', text, time);

const Alert = {
  success,
  error,
  warning,
  info
};

export default Alert;
