/* eslint-disable jsx-a11y/no-static-element-interactions */

import React from 'react';
import PropTypes from 'prop-types';
import { iconRight } from '../../icons/Icons';
import { TopBar } from '../containers';

class AccquireInformation extends React.Component {
  constructor(props) {
    super(props);

    this.state = { type: 'email', value: '' };

    this.save = this.save.bind(this);
    this.onTypeChange = this.onTypeChange.bind(this);
    this.onValueChange = this.onValueChange.bind(this);
  }

  onTypeChange(type) {
    this.setState({ type });
  }

  onValueChange(e) {
    this.setState({ value: e.target.value });
  }

  save(e) {
    e.preventDefault();

    this.props.save(this.state);
  }

  render() {
    const { __ } = this.context;
    const { color } = this.props;
    const { type } = this.state;

    const title = (
      <div className="erxes-topbar-title">
        <div>{__('Contact')}</div>
        <span>{__('Give us your contact information')}</span>
      </div>
    );

    const style = { border: `1px solid ${color}` };

    return (
      <div className="erxes-messenger accquire-information" style={style}>
        <TopBar middle={title} />

        <div className="content">
          <p className="type">
            <span
              className={type === 'email' ? 'current' : ''}
              onClick={() => this.onTypeChange('email')}
            >
              {__('Email')}
            </span>

            <span
              className={type === 'phone' ? 'current' : ''}
              onClick={() => this.onTypeChange('phone')}
            >
              {__('SMS')}
            </span>
          </p>

          <form className="form" onSubmit={this.save}>
            <input
              onChange={this.onValueChange}
              placeholder={
                type === 'email' ? __('email@domain.com') : __('phone number')
              }
              style={{ borderColor: color }}
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
