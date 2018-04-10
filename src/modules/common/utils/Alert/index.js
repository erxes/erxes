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

this.alertcount = 0;

const createAlert = (type, text) => {
  this.alertcount++;
  if (this.timeout) {
    clearTimeout(this.timeout);
  }

  this.timeout = setTimeout(() => {
    this.alertcount = 0;
    if (document.getElementById('alert-container')) {
      document.body.removeChild(document.getElementById('alert-container'));
    }
  }, 3500);

  if (document.getElementById('alert-container')) {
    const wrapper = document.getElementById('alert-wrapper');

    ReactDOM.render(
      <AlertStyled key={this.alertcount} type={type} text={text} />,
      wrapper
    );
  } else {
    const _popup = document.createElement('div');
    _popup.setAttribute('id', 'alert-container');
    document.body.appendChild(_popup);

    ReactDOM.render(<AlertWrapper />, _popup);
    const wrapper = document.getElementById('alert-wrapper');

    ReactDOM.render(
      <AlertStyled key={this.alertcount} type={type} text={text} />,
      wrapper
    );
  }
};

const success = text => {
  createAlert('success', text);
};

const error = text => {
  createAlert('error', text.replace('GraphQL error:', ''));
};

const warning = text => {
  createAlert('warning', text);
};

const info = text => {
  createAlert('info', text);
};

const Alert = {
  success,
  error,
  warning,
  info
};

export default Alert;
