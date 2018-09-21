import React from 'react';
import Modal from 'react-bootstrap/lib/Modal';
import styled from 'styled-components';
import { colors, dimensions } from '../styles';
import Button from './Button';
import Icon from './Icon';

const ModalBody = styled.div`
  text-align: center;
  padding: ${dimensions.coreSpacing}px;
  font-size: 16px;
  font-weight: 500;
`;

const ModalFooter = styled.div`
  padding: 11px ${dimensions.coreSpacing}px;
  background: ${colors.colorWhite};
  border-top: 1px solid ${colors.borderPrimary};
  border-radius: 4px;
  display: flex;
  justify-content: space-around;
`;

const IconWrapper = styled.div`
  font-size: 38px;
  color: ${colors.colorSecondary};
`;

type Props = {
  options: any;
  confirmation?: string;
  proceed: (value: string) => void;
  dismiss: () => void;
};

type State = {
  show: boolean;
}

class ConfirmDialog extends React.Component<Props, State> {
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
            <Icon icon="information" />
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