import React from 'react';
import Modal from 'react-bootstrap/Modal';
import styled from 'styled-components';
import { colors, dimensions } from '../styles';
import Button from './Button';
import Icon from './Icon';

const ModalBody = styled.div`
  text-align: center;
  padding: ${dimensions.coreSpacing}px;
  font-size: 15px;
  font-weight: 500;
`;

const ModalFooter = styled.div`
  padding: 11px ${dimensions.coreSpacing}px;
  background: ${colors.colorWhite};
  border-top: 1px solid ${colors.borderPrimary};
  border-radius: 4px;
  display: flex;
  justify-content: space-evenly;
`;

const IconWrapper = styled.div`
  font-size: 40px;
  color: ${colors.colorSecondary};
`;

type Props = {
  options?: {
    okLabel?: string;
    cancelLabel?: string;
    enableEscape?: boolean;
  };
  confirmation?: string;
  proceed: () => void;
  dismiss: () => void;
};

type State = {
  show: boolean;
};

class ConfirmDialog extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = { show: true };
  }

  dismiss = () => {
    this.setState({ show: false }, () => {
      this.props.dismiss();
    });
  };

  proceed = () => {
    this.setState({ show: false }, () => {
      this.props.proceed();
    });
  };

  handleKeydown = e => {
    if (e.key === 'Enter') {
      this.proceed();
    }
  };

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeydown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeydown);
  }

  render() {
    const {
      confirmation = 'Are you sure? This cannot be undone.'
    } = this.props;

    const {
      okLabel = 'Yes, I am',
      cancelLabel = 'No, Cancel',
      enableEscape = true
    } = this.props.options || {};

    return (
      <Modal
        show={this.state.show}
        onHide={this.dismiss}
        backdrop={enableEscape ? true : 'static'}
        keyboard={enableEscape}
        size="sm"
        centered={true}
      >
        <ModalBody>
          <IconWrapper>
            <Icon icon="exclamation-triangle" />
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

export default ConfirmDialog;
