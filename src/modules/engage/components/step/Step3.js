import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MessengerForm from './MessengerForm';
import EmailForm from './EmailForm';

const propTypes = {
  brands: PropTypes.array,
  changeEmail: PropTypes.func,
  changeMessenger: PropTypes.func,
  changeMessage: PropTypes.func,
  message: PropTypes.string,
  changeUser: PropTypes.func,
  users: PropTypes.array,
  method: PropTypes.string,
  templates: PropTypes.array
};

class Step3 extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fromUser: '',
      messenger: {
        brandId: '',
        kind: '',
        sentAs: ''
      },
      email: {
        templateId: '',
        subject: ''
      }
    };
  }

  render() {
    const {
      brands,
      changeMessenger,
      changeEmail,
      changeMessage,
      message,
      changeUser,
      users,
      method,
      templates
    } = this.props;

    if (method === 'email') {
      return (
        <EmailForm
          changeEmail={changeEmail}
          changeMessage={changeMessage}
          message={message}
          changeUser={changeUser}
          users={users}
          templates={templates}
        />
      );
    }

    return (
      <MessengerForm
        brands={brands}
        changeMessenger={changeMessenger}
        changeMessage={changeMessage}
        message={message}
        changeUser={changeUser}
        users={users}
      />
    );
  }
}

Step3.propTypes = propTypes;

export default Step3;
