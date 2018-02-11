import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { MessengerForm, EmailForm } from '../';

const propTypes = {
  brands: PropTypes.array,
  changeState: PropTypes.func,
  message: PropTypes.string,
  users: PropTypes.array,
  method: PropTypes.string,
  templates: PropTypes.array
};

class MessageStep extends Component {
  render() {
    const {
      brands,
      changeState,
      message,
      users,
      method,
      templates
    } = this.props;

    if (method === 'email') {
      return (
        <EmailForm
          changeEmail={changeState}
          message={message}
          users={users}
          templates={templates}
        />
      );
    }

    return (
      <MessengerForm
        brands={brands}
        changeMessenger={changeState}
        message={message}
        users={users}
        hasKind={true}
      />
    );
  }
}

MessageStep.propTypes = propTypes;

export default MessageStep;
