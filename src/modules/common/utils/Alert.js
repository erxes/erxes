import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Icon from '../components/Icon';
import { colors, typography } from '../styles';

const types = {
  info: {
    background: colors.colorSecondary,
    icon: 'information-circled'
  },
  warning: {
    background: colors.colorCoreYellow,
    icon: 'alert-circled'
  },
  error: {
    background: colors.colorCoreRed,
    icon: 'alert'
  },
  success: {
    background: colors.colorCoreGreen,
    icon: 'checkmark-circled'
  }
};
const Alertwrapper = styled.div.attrs({
  id: 'alertwrapper'
})`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background: transparent;
`;
const Alertstyled = styled.div`
  display: table;
  margin: 0 auto;
  border-radius: 2px;
  top: 20px;
  transition: top 2s;
  padding: 8px 48px 8px 38px;
  z-index: 1;
  font-weight: ${typography.fontWeightMedium};
  background-color: ${props => types[props.type].background};
  font-weight: bold;
  position: relative;
  text-align: left;
  span {
    margin-left: 5px;
    color: #fff;
    line-height: 1.5;
  }
  i {
    color: white;
  }
`;

const createAlertWrapper = second => {
  this._popup = document.createElement('div');
  document.body.appendChild(this._popup);
  ReactDOM.render(<Alertwrapper />, this._popup);
  setTimeout(() => {
    ReactDOM.unmountComponentAtNode(this._popup);
    document.body.removeChild(this._popup);
  }, second * 1000);
};
const renderAlert = (text, type) => {
  const target = document.getElementById('alertwrapper');
  ReactDOM.render(
    <Alertstyled type={type} visible={true}>
      <Icon icon={types[type].icon} />
      <span>{text}</span>
    </Alertstyled>,
    target
  );
};
renderAlert.propTypes = {
  type: PropTypes.oneOf(['info', 'success', 'error', 'warning']),
  text: PropTypes.string
};
renderAlert.defaultProps = {
  type: 'info'
};
const pop = (text, type) => {
  createAlertWrapper(4);
  renderAlert(text, type);
};
export const notify = {
  pop
};
