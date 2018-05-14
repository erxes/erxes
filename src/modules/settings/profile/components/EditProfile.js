import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Button } from 'modules/common/components';
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
    this.confirm = this.confirm.bind(this);
    this.onAvatarUpload = this.onAvatarUpload.bind(this);
    this.closeConfirmation = this.closeConfirmation.bind(this);

    this.state = {
      doc: {},
      showConfirmation: false,
      avatar: props.currentUser.details.avatar
    };
  }

  confirm(password) {
    const { avatar, doc } = this.state;

    const args = {
      username: doc.username,
      email: doc.email,
      details: {
        avatar: avatar,
        fullName: doc.fullName,
        position: doc.position,
        location: doc.userLocation,
        description: doc.description
      },
      links: {
        linkedIn: doc.linkedIn,
        twitter: doc.twitter,
        facebook: doc.facebook,
        youtube: doc.youtube,
        github: doc.github,
        website: doc.website
      }
    };

    this.props.save({ ...args, avatar, password }, error => {
      if (!error) {
        this.setState({ showConfirmation: false });
        this.context.closeModal();
      }
    });
  }

  handleSubmit(doc) {
    this.setState({ doc, showConfirmation: true });
  }

  onAvatarUpload(url) {
    this.setState({ avatar: url });
  }

  closeConfirmation() {
    this.setState({ showConfirmation: false });
  }

  renderConfirmation() {
    const { showConfirmation } = this.state;

    if (showConfirmation) {
      return (
        <PasswordConfirmation
          show={showConfirmation}
          close={this.closeConfirmation}
          onSuccess={password => this.confirm(password)}
        />
      );
    }

    return null;
  }

  render() {
    return (
      <Form onSubmit={this.handleSubmit}>
        <UserCommonInfos
          user={this.props.currentUser}
          onAvatarUpload={this.onAvatarUpload}
        />

        {this.renderConfirmation()}

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={() => this.context.closeModal()}
            icon="cancel-1"
          >
            Cancel
          </Button>

          <Button btnStyle="success" type="submit" icon="checked-1">
            Save
          </Button>
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
