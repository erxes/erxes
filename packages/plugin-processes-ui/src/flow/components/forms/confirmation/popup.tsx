import React from 'react';
import Modal from 'react-bootstrap/Modal';
import { IconWrapper, ModalFooter, ModalBody } from './styles';
import Icon from '@erxes/ui/src/components/Icon';
import Button from '@erxes/ui/src/components/Button';
import { __ } from 'coreui/utils';

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
      ? `Please save or delete this flow`
      : `Please save or discard these changes`;
    const confirmText = queryParams.isCreate ? 'Save flow' : 'Save';
    const cancelText = queryParams.isCreate ? 'Delete flow' : 'Discard';

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
