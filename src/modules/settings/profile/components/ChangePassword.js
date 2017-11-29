import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  FormGroup,
  ControlLabel,
  FormControl,
  Icon
} from 'modules/common/components';
import { Wrapper } from 'modules/layout/components';
import Sidebar from '../../Sidebar';
import { ContentBox, SubHeading } from '../../styles';

const propTypes = {
  save: PropTypes.func.isRequired
};

class ChangePassword extends Component {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();

    this.props.save({
      currentPassword: document.getElementById('current-password').value,
      newPassword: document.getElementById('new-password').value,
      confirmation: document.getElementById('new-password-confirmation').value
    });
  }

  render() {
    const content = (
      <ContentBox>
        <SubHeading>Change Password</SubHeading>
        <form onSubmit={this.handleSubmit}>
          <FormGroup>
            <ControlLabel>Current Password</ControlLabel>
            <FormControl
              type="password"
              placeholder="Current password"
              id="current-password"
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>New Password</ControlLabel>
            <FormControl
              type="password"
              placeholder="Enter new password"
              id="new-password"
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Re-type Password to confirm</ControlLabel>
            <FormControl
              type="password"
              placeholder="Re-type password"
              id="new-password-confirmation"
            />
          </FormGroup>
        </form>
      </ContentBox>
    );

    const breadcrumb = [
      { title: 'Settings', link: '/settings/channels' },
      { title: 'Change password' }
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

ChangePassword.propTypes = propTypes;

export default ChangePassword;
