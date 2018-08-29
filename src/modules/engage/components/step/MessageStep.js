import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { MessengerForm, EmailForm } from '../';

const propTypes = {
  brands: PropTypes.array,
  changeState: PropTypes.func,
  users: PropTypes.array,
  method: PropTypes.string,
  templates: PropTypes.array,
  defaultValue: PropTypes.object,
  kind: PropTypes.string
};

class MessageStep extends Component {
  render() {
    const {
      brands,
      changeState,
      users,
      method,
      templates,
      defaultValue,
      kind
    } = this.props;

    if (method === 'email') {
      return (
        <EmailForm
          changeEmail={changeState}
          defaultValue={defaultValue}
          users={users}
          templates={templates}
          kind={kind}
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
        kind={kind}
      />
    );
  }
}

MessageStep.propTypes = propTypes;

export default MessageStep;
