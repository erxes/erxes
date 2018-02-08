import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, ModalTrigger } from 'modules/common/components';
import { UserCommonInfos } from 'modules/auth/components';
import { ActionBar, Wrapper } from 'modules/layout/components';
import Sidebar from 'modules/settings/Sidebar';
import { ContentBox } from '../../styles';
import { PasswordConfirmation } from './';

const propTypes = {
  currentUser: PropTypes.object.isRequired,
  save: PropTypes.func.isRequired
};

class Profile extends Component {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.onAvatarUpload = this.onAvatarUpload.bind(this);

    this.state = { avatar: props.currentUser.details.avatar };
  }

  handleSubmit(password) {
    const location = document.getElementById('location');
    const locationValue = location.options[location.selectedIndex].value;

    this.props.save({
      username: document.getElementById('username').value,
      email: document.getElementById('email').value,
      details: {
        avatar: this.state.avatar,
        fullName: document.getElementById('fullName').value,
        position: document.getElementById('position').value,
        location: locationValue,
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

    const content = (
      <ContentBox>
        <UserCommonInfos
          user={this.props.currentUser}
          onAvatarUpload={this.onAvatarUpload}
        />
      </ContentBox>
    );

    const breadcrumb = [
      { title: 'Settings', link: '/settings' },
      { title: 'Profile settings' }
    ];

    const actionFooter = (
      <ActionBar
        right={
          <ModalTrigger
            title="Enter your password to Confirm"
            trigger={saveButton}
          >
            <PasswordConfirmation
              onSuccess={password => this.handleSubmit(password)}
            />
          </ModalTrigger>
        }
      />
    );

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        leftSidebar={<Sidebar />}
        footer={actionFooter}
        content={content}
      />
    );
  }
}

Profile.propTypes = propTypes;

export default Profile;
