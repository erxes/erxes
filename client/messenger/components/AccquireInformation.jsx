/* eslint-disable jsx-a11y/no-static-element-interactions */

import React, { PropTypes, Component } from 'react';
import { iconRight, iconPlus } from '../../icons/Icons';
import { TopBar } from '../containers';

class AccquireInformation extends Component {
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
    const { color } = this.props;
    const { type } = this.state;

    const title = (
      <div className="erxes-topbar-title">
        <div>Contact</div>
        <span>Give us your contact information</span>
      </div>
    );

    const style = { border: `1px solid ${color}` };

    return (
      <div className="erxes-messenger accquire-information" style={style}>
        <TopBar middle={title} buttonIcon={iconPlus} />

        <div className="content">
          <p className="type">
            <span
              className={type === 'email' ? 'current' : ''}
              onClick={() => this.onTypeChange('email')}
            >
              Email
            </span>

            <span
              className={type === 'phone' ? 'current' : ''}
              onClick={() => this.onTypeChange('phone')}
            >
              SMS
            </span>
          </p>

          <form className="form" onSubmit={this.save}>
            <input
              onChange={this.onValueChange}
              placeholder={
                type === 'email' ? 'email@domain.com' : 'phone number ...'
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

export default AccquireInformation;
