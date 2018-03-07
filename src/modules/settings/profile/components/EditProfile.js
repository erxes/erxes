import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import { Button, ModalTrigger } from 'modules/common/components';
import { UserCommonInfos } from 'modules/auth/components';
import { ContentBox } from '../../styles';
import { PasswordConfirmation } from './';

const propTypes = {
  currentUser: PropTypes.object.isRequired,
  save: PropTypes.func.isRequired
};

class EditProfile extends Component {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.onAvatarUpload = this.onAvatarUpload.bind(this);

    this.state = { avatar: props.currentUser.details.avatar };
  }

  handleSubmit(password) {
    this.props.save({
      username: document.getElementById('username').value,
      email: document.getElementById('email').value,
      details: {
        avatar: this.state.avatar,
        fullName: document.getElementById('fullName').value,
        position: document.getElementById('position').value,
        location: document.getElementById('user-location').value,
        description: document.getElementById('description').value,
        twitterUsername: document.getElementById('twitterUsername').value
      },
      links: {
        linkedIn: document.getElementById('linkedin').value,
        twitter: document.getElementById('twitter').value,
        facebook: document.getElementById('facebook').value,
        youtube: document.getElementById('youtube').value,
        github: document.getElementById('github').value,
        website: document.getElementById('website').value
      },
      password
    });

    this.context.closeModal();
  }

  onAvatarUpload(url) {
    this.setState({ avatar: url });
  }

  render() {
    const saveButton = (
      <Button btnStyle="success" icon="checkmark">
        Save
      </Button>
    );

    return (
      <ContentBox>
        <UserCommonInfos
          user={this.props.currentUser}
          onAvatarUpload={this.onAvatarUpload}
        />

        <Modal.Footer>
          <Button
            btnStyle="simple"
            type="button"
            onClick={() => this.context.closeModal()}
            icon="close"
          >
            Cancel
          </Button>

          <ModalTrigger
            title="Enter your password to Confirm"
            trigger={saveButton}
          >
            <PasswordConfirmation
              onSuccess={password => this.handleSubmit(password)}
            />
          </ModalTrigger>
        </Modal.Footer>
      </ContentBox>
    );
  }
}

EditProfile.propTypes = propTypes;
EditProfile.contextTypes = {
  __: PropTypes.func,
  closeModal: PropTypes.func
};

export default EditProfile;
