import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { MessengerForm, EmailForm } from '../';

const propTypes = {
  brands: PropTypes.array,
  changeState: PropTypes.func,
  users: PropTypes.array,
  method: PropTypes.string,
  templates: PropTypes.array,
  defaultValue: PropTypes.object
};

class MessageStep extends Component {
  render() {
    const {
      brands,
      changeState,
      users,
      method,
      templates,
      defaultValue
    } = this.props;

    if (method === 'email') {
      return (
        <EmailForm
          changeEmail={changeState}
          defaultValue={defaultValue}
          users={users}
          templates={templates}
        />
      );
    }

    return (
      <MessengerForm
        brands={brands}
        changeMessenger={changeState}
        defaultValue={defaultValue}
        users={users}
        hasKind={true}
      />
    );
  }
}

MessageStep.propTypes = propTypes;

export default MessageStep;
