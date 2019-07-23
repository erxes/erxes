import UserCommonInfos from 'modules/auth/components/UserCommonInfos';
import { IUser, IUserDoc } from 'modules/auth/types';
import Button from 'modules/common/components/Button';
import Form from 'modules/common/components/form/Form';
import { ModalFooter } from 'modules/common/styles/main';
import { IFormProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import React from 'react';
import { Modal } from 'react-bootstrap';
import PasswordConfirmation from './PasswordConfirmation';

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

  closeConfirm = () => {
    this.setState({ isShowPasswordPopup: false });
  };

  closeAllModals = () => {
    this.closeConfirm();
    this.props.closeModal();
  };

  handleSubmit = (password: string, values: any) => {
    this.props.save(
      {
        username: values.username,
        email: values.email,
        details: {
          avatar: this.state.avatar,
          shortName: values.shortName,
          fullName: values.fullName,
          position: values.position,
          location: values.userLocation,
          description: values.description
        },
        links: {
          linkedIn: values.linkedin,
          twitter: values.twitter,
          facebook: values.facebook,
          youtube: values.youtube,
          github: values.github,
          website: values.website
        },
        password
      },
      this.closeAllModals
    );
  };

  onAvatarUpload = url => {
    this.setState({ avatar: url });
  };

  onSuccess = (password: string, values: any[]) => {
    return this.handleSubmit(password, values);
  };

  showConfirm = () => {
    return this.setState({ isShowPasswordPopup: true });
  };

  renderPasswordConfirmationModal(formProps: IFormProps) {
    return (
      <Modal show={this.state.isShowPasswordPopup} onHide={this.closeConfirm}>
        <Modal.Header closeButton={true}>
          <Modal.Title>{__('Enter your password to Confirm')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <PasswordConfirmation
            formProps={formProps}
            onSuccess={this.onSuccess}
            closeModal={this.closeConfirm}
          />
        </Modal.Body>
      </Modal>
    );
  }

  renderContent = formProps => {
    return (
      <>
        <UserCommonInfos
          formProps={formProps}
          user={this.props.currentUser}
          onAvatarUpload={this.onAvatarUpload}
        />

        {this.renderPasswordConfirmationModal(formProps)}

        <ModalFooter>
          <Button
            btnStyle="simple"
            onClick={this.props.closeModal}
            icon="cancel-1"
          >
            Cancel
          </Button>

          <Button type="submit" btnStyle="success" icon="checked-1">
            Save
          </Button>
        </ModalFooter>
      </>
    );
  };

  render() {
    return (
      <Form renderContent={this.renderContent} onSubmit={this.showConfirm} />
    );
  }
}

export default EditProfile;
