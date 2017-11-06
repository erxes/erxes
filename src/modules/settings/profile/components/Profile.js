import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  FormGroup,
  ControlLabel,
  FormControl,
  Button,
  Icon
} from 'modules/common/components';
import { UserCommonInfos } from 'modules/auth/components';
import { Wrapper } from 'modules/layout/components';
import Sidebar from '../../Sidebar';
import { ContentBox } from '../../styles';

const propTypes = {
  currentUser: PropTypes.object.isRequired,
  save: PropTypes.func.isRequired
};

class Profile extends Component {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();

    this.props.save({
      username: document.getElementById('username').value,
      email: document.getElementById('email').value,
      details: {
        avatar: document.getElementById('avatar').value,
        fullName: document.getElementById('fullName').value,
        position: document.getElementById('position').value,
        twitterUsername: document.getElementById('twitterUsername').value
      },
      password: document.getElementById('password').value
    });
  }

  render() {
    const content = (
      <ContentBox>
        <form onSubmit={this.handleSubmit}>
          <UserCommonInfos user={this.props.currentUser} />

          <FormGroup>
            <ControlLabel>Current password</ControlLabel>
            <FormControl id="password" type="password" />
          </FormGroup>
        </form>
      </ContentBox>
    );

    const breadcrumb = [
      { title: 'Settings', link: '/settings/channels' },
      { title: 'Profile settings' }
    ];

    const actionFooter = (
      <Wrapper.ActionBar
        right={
          <Button btnStyle="success" onClick={this.handleSubmit}>
            <Icon icon="checkmark" /> Save
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

export default Profile;
