import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Button, ModalTrigger } from 'modules/common/components';
import { UserCommonInfos } from 'modules/auth/components';
import { PasswordConfirmation } from './';
import { ModalFooter } from 'modules/common/styles/main';

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
        description: document.getElementById('description').value
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
      <Button btnStyle="success" icon="checked-1">
        Save
      </Button>
    );

    return (
      <Fragment>
        <UserCommonInfos
          user={this.props.currentUser}
          onAvatarUpload={this.onAvatarUpload}
        />

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={() => this.context.closeModal()}
            icon="cancel-1"
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
        </ModalFooter>
      </Fragment>
    );
  }
}

EditProfile.propTypes = propTypes;
EditProfile.contextTypes = {
  __: PropTypes.func,
  closeModal: PropTypes.func
};

export default EditProfile;
