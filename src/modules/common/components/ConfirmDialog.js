import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Modal from 'react-bootstrap/lib/Modal';
import Button from './Button';
import Icon from './Icon';
import { colors, dimensions } from '../styles';

const ModalBody = styled.div`
  text-align: center;
  padding: ${dimensions.coreSpacing}px;
  font-size: 16px;
  font-weight: 500;
`;

const ModalFooter = styled.div`
  padding: 11px ${dimensions.coreSpacing}px;
  background: ${colors.bgLight};
  border-top: 1px solid ${colors.borderPrimary};
  display: flex;
  justify-content: space-around;
`;

const IconWrapper = styled.div`
  font-size: 38px;
  color: ${colors.colorSecondary};
`;

class ConfirmDialog extends React.Component {
  constructor(props) {
    super(props);

    this.state = { show: true };

    this.dismiss = this.dismiss.bind(this);
    this.proceed = this.proceed.bind(this);
  }

  dismiss() {
    this.setState({ show: false }, () => {
      this.props.dismiss();
    });
  }

  proceed(value) {
    this.setState({ show: false }, () => {
      this.props.proceed(value);
    });
  }

  render() {
    const { confirmation = 'Are you sure?' } = this.props;

    const {
      okLabel = 'Yes, I am',
      cancelLabel = 'No, Cancel',
      enableEscape = true
    } = this.props.options;

    return (
      <Modal
        show={this.state.show}
        onHide={this.dismiss}
        backdrop={enableEscape ? true : 'static'}
        keyboard={enableEscape}
        bsSize="small"
      >
        <ModalBody>
          <IconWrapper>
            <Icon icon="ios-information-outline" />
          </IconWrapper>
          {confirmation}
        </ModalBody>
        <ModalFooter>
          <Button
            size="small"
            btnStyle="simple"
            onClick={this.dismiss}
            icon="cancel-1"
          >
            {cancelLabel}
          </Button>
          <Button
            size="small"
            btnStyle="success"
            onClick={this.proceed}
            icon="checked-1"
          >
            {okLabel}
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

ConfirmDialog.propTypes = {
  options: PropTypes.object,
  confirmation: PropTypes.string,
  proceed: PropTypes.func,
  dismiss: PropTypes.func
};

export default ConfirmDialog;
