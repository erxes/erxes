import T from 'i18n-react';
import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import AlertStyled from './Alert';

const AlertWrapper = styled.div.attrs({
  id: 'alert-wrapper'
})`
  position: fixed;
  top: 0;
  left: 50%;
  height: 0;
  transform: translateX(-50%);
  width: auto;
  background: transparent;
  z-index: 5080;
  font-size: 14px;
`;

let alertcount = 0;
let timeout;

const createAlert = (type: string, text: string, time?: number) => {
  alertcount++;

  if (timeout) {
    clearTimeout(timeout);
  }

  timeout = setTimeout(() => {
    alertcount = 0;

    if (document.getElementById('alert-container')) {
      const container = document.getElementById('alert-container');

      if (container) {
        document.body.removeChild(container);
      }
    }
  }, time || 3500);

  if (!document.getElementById('alert-container')) {
    const popup = document.createElement('div');
    popup.setAttribute('id', 'alert-container');
    document.body.appendChild(popup);

    ReactDOM.render(<AlertWrapper />, popup);
  }

  const wrapper = document.getElementById('alert-wrapper');

  ReactDOM.render(
    <AlertStyled key={alertcount} type={type}>
      {T.translate(text)}
    </AlertStyled>,
    wrapper
  );
};

const success = (text: string, time?: number) =>
  createAlert('success', text, time);
const error = (text: string, time?: number) =>
  createAlert('error', text.replace('GraphQL error:', ''), time);
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
