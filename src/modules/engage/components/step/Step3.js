import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MessengerForm from './MessengerForm';
import EmailForm from './EmailForm';

const propTypes = {
  brands: PropTypes.array,
  changeState: PropTypes.func,
  message: PropTypes.string,
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
      />
    );
  }
}

Step3.propTypes = propTypes;

export default Step3;
