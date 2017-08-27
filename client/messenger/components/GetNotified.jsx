import React, { PropTypes, Component } from 'react';

class GetNotified extends Component {
  constructor(props) {
    super(props);

    this.saveGetNotifedValue = this.saveGetNotifedValue.bind(this);
  }

  saveGetNotifedValue(e) {
    e.preventDefault();

    const type = 'email';
    const value = document.querySelector('#get-notified-value').value;

    this.props.saveGetNotifedValue(type, value);
  }

  render() {
    const { color } = this.props;

    if (!this.props.isObtainedGetNotifiedType) {
      return (
        <li className="erxes-spacial-message ml50">
          <label htmlFor="get-notified-value">Get notified</label>
          <div className="ask-email">
            <input
              id="get-notified-value"
              placeholder="email@domain.com"
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
