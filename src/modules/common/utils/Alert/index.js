import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import AlertStyled from './Alert';

const Alertwrapper = styled.div.attrs({
  id: 'alertwrapper'
})`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background: transparent;
`;

this.alertcount = 0;
const createAlert = (type, text) => {
  this.alertcount++;
  if (this.timeout) {
    clearTimeout(this.timeout);
  }
  this.timeout = setTimeout(() => {
    this.alertcount = 0;
    if (document.getElementById('replaceralertwrapper')) {
      document.body.removeChild(
        document.getElementById('replaceralertwrapper')
      );
    }
  }, 3500);
  if (document.getElementById('replaceralertwrapper')) {
    const wrapper = document.getElementById('alertwrapper');
    ReactDOM.render(
      <AlertStyled key={this.alertcount} type={type} text={text} />,
      wrapper
    );
  } else {
    const _popup = document.createElement('div');
    _popup.setAttribute('id', 'replaceralertwrapper');
    document.body.appendChild(_popup);
    ReactDOM.render(<Alertwrapper />, _popup);
    const wrapper = document.getElementById('alertwrapper');
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
  createAlert('error', text);
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
