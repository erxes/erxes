import React, { PropTypes } from 'react';
import { Button, FormGroup, ControlLabel, FormControl, ButtonToolbar } from 'react-bootstrap';
import Alert from 'meteor/erxes-notifier';
import { Wrapper } from '/imports/react-ui/layout/components';
import Sidebar from '../../Sidebar.jsx';

const propTypes = {
  user: PropTypes.object.isRequired,
  save: PropTypes.func.isRequired,
};

class ChangePassword extends React.Component {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();

    this.props.save(
      {
        currentPassword: document.getElementById('current-password').value,
        newPassword: document.getElementById('new-password').value,
        confirmation: document.getElementById('new-password-confirmation').value,
      },
      error => {
        if (error) return Alert.error(error.reason);

        return Alert.success('Your password has been changed, now and forever more!');
      },
    );
  }

  render() {
    const content = (
      <div className="margined">
        <form onSubmit={this.handleSubmit}>
          <FormGroup>
            <ControlLabel>Current Password</ControlLabel>
            <FormControl type="password" placeholder="Current password" id="current-password" />
          </FormGroup>

          <FormGroup>
            <ControlLabel>New Password</ControlLabel>
            <FormControl type="password" placeholder="Enter new password" id="new-password" />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Re-type Password to confirm</ControlLabel>
            <FormControl
              type="password"
              placeholder="Re-type password"
              id="new-password-confirmation"
            />
          </FormGroup>

          <ButtonToolbar className="pull-right">
            <Button type="submit" bsStyle="primary">Save</Button>
          </ButtonToolbar>
        </form>
      </div>
    );

    const breadcrumb = [
      { title: 'Settings', link: '/settings/channels' },
      { title: 'Change password' },
    ];

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        leftSidebar={<Sidebar />}
        content={content}
      />
    );
  }
}

ChangePassword.propTypes = propTypes;

export default ChangePassword;
