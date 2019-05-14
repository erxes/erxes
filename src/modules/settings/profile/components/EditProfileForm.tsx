import { UserCommonInfos } from 'modules/auth/components';
import { IUser, IUserDoc } from 'modules/auth/types';
import { Button, Form } from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import { Modal } from 'react-bootstrap';
import { PasswordConfirmation } from '.';

type Props = {
  currentUser: IUser;
  closeModal: () => void;
  save: (
    variables: IUserDoc & { password?: string },
    callback: () => void
  ) => void;
};

type State = {
  avatar: string;
  isShowPasswordPopup: boolean;
};

class EditProfile extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { currentUser } = props;
    const { details } = currentUser;

    this.state = {
      avatar: details ? details.avatar || '' : '',
      isShowPasswordPopup: false
    };
  }

  getInputElementValue(id) {
    return (document.getElementById(id) as HTMLInputElement).value;
  }

  closeConfirm = () => {
    this.setState({ isShowPasswordPopup: false });
  };

  closeAllModals = () => {
    this.closeConfirm();
    this.props.closeModal();
  };

  handleSubmit = password => {
    this.props.save(
      {
        username: this.getInputElementValue('username'),
        email: this.getInputElementValue('email'),
        details: {
          avatar: this.state.avatar,
          shortName: this.getInputElementValue('shortName'),
          fullName: this.getInputElementValue('fullName'),
          position: this.getInputElementValue('position'),
          location: this.getInputElementValue('user-location'),
          description: this.getInputElementValue('description')
        },
        links: {
          linkedIn: this.getInputElementValue('linkedin'),
          twitter: this.getInputElementValue('twitter'),
          facebook: this.getInputElementValue('facebook'),
          youtube: this.getInputElementValue('youtube'),
          github: this.getInputElementValue('github'),
          website: this.getInputElementValue('website')
        },
        password
      },
      this.closeAllModals
    );
  };

  onAvatarUpload = url => {
    this.setState({ avatar: url });
  };

  onSuccess = password => {
    return this.handleSubmit(password);
  };

  showConfirm = () => {
    return this.setState({ isShowPasswordPopup: true });
  };

  renderPasswordConfirmationModal(props) {
    return (
      <Modal show={this.state.isShowPasswordPopup} onHide={this.closeConfirm}>
        <Modal.Header closeButton={true}>
          <Modal.Title>{__('Enter your password to Confirm')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <PasswordConfirmation
            {...props}
            onSuccess={this.onSuccess}
            closeModal={this.closeConfirm}
          />
        </Modal.Body>
      </Modal>
    );
  }

  renderContent = props => {
    return (
      <>
        <UserCommonInfos
          {...props}
          user={this.props.currentUser}
          onAvatarUpload={this.onAvatarUpload}
        />

        {this.renderPasswordConfirmationModal(props)}

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={this.props.closeModal}
            icon="cancel-1"
          >
            Cancel
          </Button>

          <Button
            btnStyle="success"
            icon="checked-1"
            onClick={props.runValidations}
          >
            Save
          </Button>
        </ModalFooter>
      </>
    );
  };

  render() {
    return (
      <Form onSubmit={this.showConfirm} renderContent={this.renderContent} />
    );
  }
}

export default EditProfile;
