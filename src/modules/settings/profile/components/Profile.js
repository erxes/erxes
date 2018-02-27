import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  FormGroup,
  ControlLabel,
  FormControl,
  Button
} from 'modules/common/components';
import { UserCommonInfos } from 'modules/auth/components';
import { ActionBar, Wrapper } from 'modules/layout/components';
import Sidebar from 'modules/settings/Sidebar';
import { ContentBox } from '../../styles';

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

  handleSubmit(e) {
    e.preventDefault();

    this.props.save({
      username: document.getElementById('username').value,
      email: document.getElementById('email').value,
      details: {
        avatar: this.state.avatar,
        fullName: document.getElementById('fullName').value,
        position: document.getElementById('position').value,
        twitterUsername: document.getElementById('twitterUsername').value
      },
      password: document.getElementById('password').value
    });
  }

  onAvatarUpload(url) {
    this.setState({ avatar: url });
  }

  render() {
    const { __ } = this.context;
    const content = (
      <ContentBox>
        <form onSubmit={this.handleSubmit}>
          <UserCommonInfos
            user={this.props.currentUser}
            onAvatarUpload={this.onAvatarUpload}
          />

          <FormGroup>
            <ControlLabel>Current password</ControlLabel>
            <FormControl id="password" type="password" />
          </FormGroup>
        </form>
      </ContentBox>
    );

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Profile settings') }
    ];

    const actionFooter = (
      <ActionBar
        right={
          <Button
            btnStyle="success"
            onClick={this.handleSubmit}
            icon="checkmark"
          >
            Save
          </Button>
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
Profile.contextTypes = {
  __: PropTypes.func
};

export default Profile;
