import React from 'react';
import Modal from 'react-bootstrap/Modal';
import { IconWrapper, ModalFooter, ModalBody } from './styles';
import Icon from 'modules/common/components/Icon';
import Button from 'modules/common/components/Button';
import { __ } from 'modules/common/utils';

type Props = {
  isOpen: boolean;
  queryParams: any;
  onConfirm: () => void;
  onCancel: () => void;
};

class ConfirmationPopup extends React.Component<Props> {
  render() {
    const { isOpen, onConfirm, onCancel, queryParams } = this.props;

    const description = queryParams.isCreate
      ? `Please save or delete this automation`
      : `Please save or discard these changes`;
    const confirmText = queryParams.isCreate ? 'Save automation' : 'Save';
    const cancelText = queryParams.isCreate ? 'Delete automation' : 'Discard';

    return (
      <Modal
        show={isOpen}
        onHide={onCancel}
        centered={true}
        backdrop="static"
        keyboard={false}
      >
        <ModalBody>
          <IconWrapper>
            <Icon icon="exclamation-triangle" />
          </IconWrapper>
          {__(description)}
        </ModalBody>
        <ModalFooter>
          <Button
            btnStyle={queryParams.isCreate ? 'danger' : 'simple'}
            onClick={onCancel}
            icon="times-circle"
            uppercase={false}
          >
            {cancelText}
          </Button>
          <Button
            btnStyle="success"
            onClick={onConfirm}
            icon="check-circle"
            uppercase={false}
          >
            {confirmText}
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

export default ConfirmationPopup;
