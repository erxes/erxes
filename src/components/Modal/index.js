import React from 'react';
import PropTypes from 'prop-types';
import Button from '../Button';
import styled, { keyframes } from 'styled-components';

const ModalStyled = styled.div`
  display: ${props => (props.visible ? 'block' : 'none')};
  position: fixed;
  z-index: 1010;
  padding-top: 100px;
  overflow-y: auto;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
`;
const animatetop = keyframes`
    from {top:-300px; opacity:0}
    to {top:0; opacity:1}
`;
const Modal_contentStyled = styled.div`
  position: relative;
  background-color: #fff;
  box-sizing: border-box;
  margin: auto;
  padding: 0;
  width: 70%;
  animation-name: ${animatetop};
  animation-duration: 0.4s;
`;
const Modal_headerStyled = styled.div`
  padding: 15px 30px;
  background-color: transparent;
  border-bottom: 1px solid #e5e5e5;
`;
const Modal_bodyStyled = styled.div`padding: 30px 30px;`;
const Modal_footerStyled = styled.div`
  padding: 20px 15px;
  background-color: transparent;
  border-top: 1px solid #e5e5e5;
  bottom: 0;
  text-align: right; !important
`;

export default class Modal extends React.Component {

  render() {
    return (
      <ModalStyled
        visible={this.props.visible}
        onClick={this.handleClick}
      >
        <Modal_contentStyled>{this.props.children}</Modal_contentStyled>
      </ModalStyled>
    );
  }
}
const Modalheader = ({ children }) => {
  return <Modal_headerStyled>{children}</Modal_headerStyled>;
};
const Modalbody = ({ children }) => {
  return <Modal_bodyStyled>{children}</Modal_bodyStyled>;
};
const Modalfooter = ({ onClose, onSuccess }) => {
  return (
    <Modal_footerStyled>
      {onSuccess !== undefined ? (
        <Button onClick={onSuccess}>Save</Button>
      ) : null}
      <button onClick={onClose}>Close</button>
    </Modal_footerStyled>
  );
};
Modal.propTypes = {
  children: PropTypes.node.isRequired,
  visible: PropTypes.bool
};

Modal.defaultProps = {
  visible: false
};
Modalheader.propTypes = {
  children: PropTypes.node
};
Modalbody.propTypes = {
  children: PropTypes.node
};
Modalfooter.propTypes = {
  children: PropTypes.node,
  onClose: PropTypes.func,
  onSuccess: PropTypes.func
};

export { Modalheader, Modalbody, Modalfooter };
