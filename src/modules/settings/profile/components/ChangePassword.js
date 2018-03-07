import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  FormGroup,
  ControlLabel,
  FormControl
} from 'modules/common/components';
import { ActionBar, Wrapper } from 'modules/layout/components';
import { ContentBox, SubHeading } from '../../styles';
import Sidebar from 'modules/settings/Sidebar';

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
    const { __ } = this.context;
    const content = (
      <ContentBox>
        <SubHeading>{__('Change Password')}</SubHeading>
        <form onSubmit={this.handleSubmit}>
          <FormGroup>
            <ControlLabel>Current Password</ControlLabel>
            <FormControl
              type="password"
              placeholder={__('Current password')}
              id="current-password"
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>New Password</ControlLabel>
            <FormControl
              type="password"
              placeholder={__('Enter new password')}
              id="new-password"
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Re-type Password to confirm</ControlLabel>
            <FormControl
              type="password"
              placeholder={__('Re-type password')}
              id="new-password-confirmation"
            />
          </FormGroup>
        </form>
      </ContentBox>
    );

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Change password') }
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

ChangePassword.propTypes = propTypes;
ChangePassword.contextTypes = {
  __: PropTypes.func
};

export default ChangePassword;
