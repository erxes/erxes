import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { iconRight } from '../../icons/Icons';
import { TopBar } from '../containers';

class AccquireInformation extends React.Component {
  constructor(props) {
    super(props);

    this.state = { type: 'email', value: '', isValidated: true };

    this.save = this.save.bind(this);
    this.onTypeChange = this.onTypeChange.bind(this);
    this.onValueChange = this.onValueChange.bind(this);
  }

  onTypeChange(type) {
    this.setState({ type });
  }

  onValueChange(e) {
    this.setState({ value: e.target.value, isValidated: true });
  }

  isPhoneValid(phoneNumber) {
    const reg = /^\d{8,}$/;
    return reg.test(phoneNumber.replace(/[\s()+\-\.]|ext/gi, ''));
  }

  isEmailValid(email) {
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return reg.test(email);
  }

  save(e) {
    e.preventDefault();

    const { value, type } = this.state;

    if((type === 'email' && this.isEmailValid(value)) || this.isPhoneValid(value)) {
      return this.props.save(this.state)
    }

    return this.setState({ isValidated: false });
  }

  render() {
    const { __ } = this.context;
    const { color } = this.props;
    const { type, isValidated } = this.state;
    const formClasses = classNames('form', { invalid: !isValidated });

    const title = (
      <div className="erxes-topbar-title">
        <div>{__('Contact')}</div>
        <span>{__('Give us your contact information')}</span>
      </div>
    );

    const style = { border: `1px solid ${color}` };

    return (
      <div className="erxes-messenger accquire-information">
        <TopBar middle={title} />

        <div className="content">
          <p className="type">
            <span
              className={type === 'email' ? 'current' : ''}
              onClick={() => this.onTypeChange('email')}
              style={{ borderColor: color }}
            >
              {__('Email')}
            </span>

            <span
              className={type === 'phone' ? 'current' : ''}
              onClick={() => this.onTypeChange('phone')}
              style={{ borderColor: color }}
            >
              {__('SMS')}
            </span>
          </p>

          <form className={formClasses} onSubmit={this.save}>
            <input
              onChange={this.onValueChange}
              placeholder={
                type === 'email' ? __('email@domain.com') : __('phone number')
              }
              type={type === 'email' ? 'text' : 'tel'}
              style={style}
            />

            <button
              onClick={this.save}
              type="submit"
              style={{ backgroundColor: color }}
            >
              {iconRight}
            </button>
          </form>
        </div>
      </div>
    );
  }
}

AccquireInformation.propTypes = {
  color: PropTypes.string,
  save: PropTypes.func,
};

AccquireInformation.contextTypes = {
  __: PropTypes.func
};

export default AccquireInformation;
