/* eslint-disable jsx-a11y/no-static-element-interactions */

import React, { PropTypes, Component } from 'react';

class GetNotified extends Component {
  constructor(props) {
    super(props);

    this.state = { type: 'email' };

    this.saveGetNotifedValue = this.saveGetNotifedValue.bind(this);
    this.setGetNotifiedType = this.setGetNotifiedType.bind(this);
  }

  setGetNotifiedType(type) {
    this.setState({ type });
  }

  saveGetNotifedValue(e) {
    e.preventDefault();

    const type = this.state.type;
    const value = document.querySelector('#get-notified-value').value;

    this.props.saveGetNotifedValue(type, value);
  }

  render() {
    const { color } = this.props;
    const { type } = this.state;

    if (!this.props.isObtainedGetNotifiedType) {
      return (
        <li className="erxes-spacial-message ml50">
          <label htmlFor="get-notified-value">Get notified</label>

          <p className="get-notified-type">
            <span
              className={type === 'email' ? 'current' : ''}
              onClick={() => this.setGetNotifiedType('email')}
            >
              Email
            </span>

            <span
              className={type === 'phone' ? 'current' : ''}
              onClick={() => this.setGetNotifiedType('phone')}
            >
              SMS
            </span>
          </p>

          <div className="ask-get-notified">
            <input
              id="get-notified-value"
              placeholder={type === 'email' ? 'email@domain.com' : 'sms ...'}
              style={{ borderColor: color }}
            />

            <button
              onClick={this.saveGetNotifedValue}
              style={{ backgroundColor: color }}
            />
          </div>
        </li>
      );
    }

    return null;
  }
}

GetNotified.propTypes = {
  isObtainedGetNotifiedType: PropTypes.bool,
  color: PropTypes.string,
  saveGetNotifedValue: PropTypes.func,
};

export default GetNotified;
