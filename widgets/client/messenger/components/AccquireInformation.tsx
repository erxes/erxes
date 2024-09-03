import * as classNames from 'classnames';
import * as React from 'react';
import { iconRight } from '../../icons/Icons';
import { __ } from '../../utils';
import TopBar from '../containers/TopBar';
import { connection } from '../connection';
import { COUNTRIES } from '../../form/constants';
import { ICountry } from '../../types';

type Props = {
  save: (doc: State) => void;
  color?: string;
  textColor?: string;
  loading: boolean;
  showTitle?: boolean;
};

type State = {
  type: string;
  value: string;
  isLoading: boolean;
  isValidated: boolean;
  country?: ICountry;
};

class AccquireInformation extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    const currentCountry = COUNTRIES.find(
      (country) => country.code === connection.browserInfo?.countryCode
    );

    this.state = {
      type: 'email',
      value: '',
      isValidated: true,
      isLoading: props.loading,
      country: currentCountry || COUNTRIES[0],
    };

    this.save = this.save.bind(this);
    this.onTypeChange = this.onTypeChange.bind(this);
    this.onValueChange = this.onValueChange.bind(this);
    this.renderTitle = this.renderTitle.bind(this);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.loading !== this.props.loading) {
      this.setState({ isLoading: nextProps.loading });
    }
  }

  onTypeChange(type: string) {
    this.setState({ type });
  }

  onValueChange(e: React.FormEvent<HTMLInputElement>) {
    const { type, country } = this.state;

    if (type === 'email') {
      return this.setState({ value: e.currentTarget.value, isValidated: true });
    }

    this.setState({
      value: `${country?.dialCode} ${e.currentTarget.value}`,
      isValidated: true,
    });
  }

  isPhoneValid(phoneNumber: string) {
    const reg = /^\d{8,}$/;
    return reg.test(phoneNumber.replace(/[\s()+\-\.]|ext/gi, ''));
  }

  isEmailValid(email: string) {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(email);
  }

  save(e: React.FormEvent) {
    e.preventDefault();

    const { value, type } = this.state;

    if (
      (type === 'email' && this.isEmailValid(value)) ||
      this.isPhoneValid(value)
    ) {
      return this.props.save(this.state);
    }

    return this.setState({ isValidated: false });
  }

  renderTitle() {
    if (!this.props.showTitle) {
      return null;
    }

    const title = (
      <div className="erxes-topbar-title">
        <div>{__('Contact')}</div>
        <span>
          {__('Please leave your contact details to start a conversation') +
            '.'}
        </span>
      </div>
    );

    return <TopBar middle={title} />;
  }

  render() {
    const { color, textColor } = this.props;
    const { type, isValidated, isLoading, country } = this.state;
    const formClasses = classNames('form', { invalid: !isValidated });

    const placeholder =
      type === 'email' ? __('email@domain.com') : __('phone number');

    return (
      <>
        {this.renderTitle()}
        <div className="accquire-information slide-in">
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
              {__('Phone')}
            </span>
          </p>

          <form className={formClasses} onSubmit={this.save}>
            {type === 'phone' ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  height: '100%',
                  flex: 1,
                }}
              >
                <input
                  id="country-select-val"
                  style={{ width: '80px', flex: 0 }}
                  value={country && `${country.emoji} ${country.dialCode}`}
                  readOnly={true}
                />

                <div style={{ height: '36px' }}>
                  <select
                    value={country?.code}
                    onChange={(e) =>
                      this.setState({
                        country: COUNTRIES.find(
                          (c) => c.code === e.target.value
                        ),
                      })
                    }
                    className="form-control"
                    style={{
                      width: '80px',
                      opacity: 0,
                      position: 'absolute',
                      left: 0,
                      cursor: 'pointer',
                    }}
                  >
                    {COUNTRIES.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name} {country.emoji}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  onChange={this.onValueChange}
                  placeholder={placeholder ? placeholder.toString() : ''}
                  type="tel"
                  autoFocus={true}
                />
              </div>
            ) : (
              <input
                onChange={this.onValueChange}
                placeholder={placeholder ? placeholder.toString() : ''}
                type="text"
                autoFocus={true}
              />
            )}

            <button
              onClick={this.save}
              type="submit"
              style={{ backgroundColor: color }}
            >
              {isLoading ? <div className="loader" /> : iconRight(textColor)}
            </button>
          </form>
        </div>
      </>
    );
  }
}

export default AccquireInformation;
