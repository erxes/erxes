import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ContentCenter, ButtonBox } from './Style';

const propTypes = {
  changeMethod: PropTypes.func,
  method: PropTypes.string
};

class Step1 extends Component {
  render() {
    return (
      <ContentCenter>
        <ButtonBox
          selected={this.props.method === 'email'}
          onClick={() => this.props.changeMethod('email')}
        >
          <span>Email</span>
          <div>
            <img src="/images/icons/erxes-08.svg" alt="Email" />
            <span>
              Delivered to a user s email inbox <br />Customize with your own
              templates
            </span>
          </div>
        </ButtonBox>
        <ButtonBox
          selected={this.props.method === 'messenger'}
          onClick={() => this.props.changeMethod('messenger')}
        >
          <span>Messenger</span>
          <div>
            <img src="/images/icons/erxes-08.svg" alt="Email" />
            <span>
              Delivered inside your app<br />Reach active users
            </span>
          </div>
        </ButtonBox>
      </ContentCenter>
    );
  }
}

Step1.propTypes = propTypes;

export default Step1;
