import { __ } from 'modules/common/utils';
import React from 'react';
import Modal from 'react-bootstrap/Modal';
import styled from 'styled-components';
import { colors, dimensions } from '../styles';
import Button from './Button';
import { ControlLabel, FormControl, FormGroup } from './form';
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
    hasDeleteConfirm?: boolean;
    hasUpdateConfirm?: boolean;
  };
  confirmation?: string;
  proceed: () => void;
  dismiss: () => void;
};

type State = {
  show: boolean;
  confirm: string;
  errors: { [key: string]: string };
};

class ConfirmDialog extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      show: true,
      confirm: '',
      errors: {}
    };
  }

  dismiss = () => {
    this.setState({ show: false }, () => {
      this.props.dismiss();
    });
  };

  invokeProceed() {
    this.setState({ show: false }, () => {
      this.props.proceed();
    });
  }

  proceed = () => {
    const { options = {} } = this.props;
    const { hasDeleteConfirm, hasUpdateConfirm } = options;

    if (hasDeleteConfirm) {
      if (this.state.confirm === 'delete') {
        return this.invokeProceed();
      }

      return this.setState({ errors: { confirm: 'Enter delete to confirm' } });
    }

    if (hasUpdateConfirm) {
      if (this.state.confirm === 'update') {
        return this.invokeProceed();
      }

      return this.setState({ errors: { confirm: 'Enter update to confirm' } });
    }

    return this.invokeProceed();
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

  handleChange = e => {
    this.setState({ confirm: e.target.value });
  };

  renderConfirmDelete() {
    const { errors, confirm } = this.state;
    const { hasDeleteConfirm = false, hasUpdateConfirm = false } =
      this.props.options || {};

    if (!hasDeleteConfirm && !hasUpdateConfirm) {
      return null;
    }

    const label = hasDeleteConfirm
      ? 'Type delete in the filed below to confirm.'
      : 'Type update in the filed below to confirm.';

    return (
      <FormGroup>
        <ControlLabel required={true} uppercase={false}>
          {label}
        </ControlLabel>
        <FormControl
          name="confirm"
          required={true}
          value={confirm}
          errors={errors}
          onChange={this.handleChange}
        />
      </FormGroup>
    );
  }

  render() {
    const { confirmation = 'Are you sure?', options = {} } = this.props;

    const {
      okLabel = 'Yes, I am',
      cancelLabel = 'No, Cancel',
      enableEscape = true
    } = options;

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
          {__(confirmation)}
          {this.renderConfirmDelete()}
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
