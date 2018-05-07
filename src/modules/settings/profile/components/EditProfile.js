import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Button, ModalTrigger } from 'modules/common/components';
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

  handleSubmit(doc) {
    this.props.save({
      username: doc.username,
      email: doc.email,
      details: {
        avatar: this.state.avatar,
        fullName: doc.fullName,
        position: doc.position,
        location: doc.userLocation,
        description: doc.description
      },
      links: {
        linkedIn: doc.linkedin,
        twitter: doc.twitter,
        facebook: doc.facebook,
        youtube: doc.youtube,
        github: doc.github,
        website: doc.website
      },
      password: doc.password
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
      <Form>
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
      </Form>
    );
  }
}

EditProfile.propTypes = propTypes;
EditProfile.contextTypes = {
  __: PropTypes.func,
  closeModal: PropTypes.func
};

export default EditProfile;
