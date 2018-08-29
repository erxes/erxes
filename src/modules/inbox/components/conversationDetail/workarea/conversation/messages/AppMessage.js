import React from 'react';
import PropTypes from 'prop-types';
import { Button, NameCard } from 'modules/common/components';
import { AppMessageBox, CallButton, UserInfo } from '../styles';

const propTypes = {
  message: PropTypes.object.isRequired
};

export default class AppMessage extends React.Component {
  render() {
    const { messengerAppData = {} } = this.props.message;
    const customerName =
      messengerAppData.customer && messengerAppData.customer.firstName;

    return (
      <AppMessageBox>
        <UserInfo>
          <NameCard.Avatar customer={messengerAppData.customer} size={60} />
          <h4>Meet with {customerName}</h4>
        </UserInfo>
        <CallButton>
          <h5>Meeting Ready</h5>
          <a href={messengerAppData.hangoutLink} target="_blank">
            <Button>Join Call</Button>
          </a>
        </CallButton>
      </AppMessageBox>
    );
  }
}

AppMessage.propTypes = propTypes;
