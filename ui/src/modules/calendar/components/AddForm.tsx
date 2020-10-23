import { __ } from 'modules/common/utils';
import React from 'react';
import Modal from 'react-bootstrap/Modal';

type Props = {
  isPopupVisible: boolean;
  add: (doc) => void;
  onHideModal: () => void;
};

class EditForm extends React.Component<Props, {}> {
  renderHeader() {
    return (
      <Modal.Header closeButton={true}>
        <Modal.Title>{__('Create Event')}</Modal.Title>
      </Modal.Header>
    );
  }

  render() {
    return (
      <Modal
        enforceFocus={false}
        show={this.props.isPopupVisible}
        onHide={this.props.onHideModal}
        animation={false}
      >
        {this.renderHeader()}
        <Modal.Body>add</Modal.Body>
      </Modal>
    );
  }
}

export default EditForm;
