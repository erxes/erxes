import { __ } from 'modules/common/utils';
import React from 'react';
import Modal from 'react-bootstrap/Modal';
import styled from 'styled-components';
import { colors, dimensions } from '../styles';
import { rgba } from '../styles/color';
import Button from './Button';
import { ControlLabel, FormControl } from './form';
import Icon from './Icon';

const ModalBody = styled.div`
  text-align: center;
  padding: ${dimensions.coreSpacing}px;
  font-size: 15px;
  font-weight: 500;

  label {
    margin-top: ${dimensions.coreSpacing}px;
    font-size: 12px;
    color: #777;

    strong {
      color: ${colors.textPrimary};
    }
  }
`;

const ModalFooter = styled.div`
  padding: 10px ${dimensions.coreSpacing}px;
  background: ${colors.colorWhite};
  border-top: 1px solid ${colors.borderPrimary};
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  display: flex;
  justify-content: center;
`;

const IconWrapper = styled.div`
  font-size: 40px;
  color: ${colors.colorSecondary};
`;

const Error = styled.span`
  font-size: 12px;
  color: ${rgba(colors.colorCoreRed, 0.8)};

  strong {
    color: ${colors.colorCoreRed};
  }
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
  errors: { [key: string]: React.ReactNode };
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

      return this.setState({
        errors: {
          confirm: (
            <Error>
              Enter <strong>delete</strong> to confirm
            </Error>
          )
        }
      });
    }

    if (hasUpdateConfirm) {
      if (this.state.confirm === 'update') {
        return this.invokeProceed();
      }

      return this.setState({
        errors: {
          confirm: (
            <Error>
              Enter <strong>update</strong> to confirm
            </Error>
          )
        }
      });
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

    const label = hasDeleteConfirm ? (
      <>
        Type <strong>delete</strong> in the filed below to confirm.
      </>
    ) : (
      <>
        Type <strong>update</strong> in the filed below to confirm.
      </>
    );

    return (
      <>
        <ControlLabel required={true} uppercase={false}>
          {label}
        </ControlLabel>
        <FormControl
          name="confirm"
          required={true}
          value={confirm}
          errors={errors}
          autoFocus={true}
          onChange={this.handleChange}
        />
      </>
    );
  }

  render() {
    const { confirmation = 'Are you sure?', options = {} } = this.props;
    const { hasDeleteConfirm, hasUpdateConfirm } = options;

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
        animation={hasDeleteConfirm || hasUpdateConfirm ? false : true}
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
            btnStyle="simple"
            onClick={this.dismiss}
            icon="times-circle"
            uppercase={false}
          >
            {cancelLabel}
          </Button>
          <Button
            btnStyle="success"
            onClick={this.proceed}
            icon="check-circle"
            uppercase={false}
          >
            {okLabel}
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

export default ConfirmDialog;
