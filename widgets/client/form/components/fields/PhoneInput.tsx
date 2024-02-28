import * as React from 'react';
import { COUNTRY_CODES } from '../../constants';
import { FieldValue } from '../../types';
import { connection } from '../../connection';

type Props = {
  id: string;
  value: string;
  onChange: (value: FieldValue) => void;
};

const PhoneInputWithCountryCode = (props: any) => {
  const { onChange } = props;

  const [dialCode, setDialCode] = React.useState('+1');
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const selectRef: any = React.createRef();

  React.useEffect(() => {
    if (connection.browserInfo) {
      const countryCode = connection.browserInfo.countryCode;
      const country = COUNTRY_CODES.find(
        (country) => country.code === countryCode
      );
      if (country) {
        setDialCode(country.dialCode);
      }
    }
  }, [connection.browserInfo]);

  const handleCountryCodeChange = (e: any) => {
    setDialCode(e.target.value);
    // Pass the country code and phone number to the parent component
    onChange(`${e.target.value}${phoneNumber}`);
  };

  const handlePhoneNumberChange = (e: any) => {
    setPhoneNumber(e.target.value);
    // Pass the country code and phone number to the parent component
    onChange(`${dialCode}${e.target.value}`);
  };

  const country = COUNTRY_CODES.find(
    (country) => country.dialCode === dialCode
  );

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        height: '100%',
      }}
    >
      <div className="form-control" style={{ width: '130px' }}>
        {country && `${country.emoji} ${country.dialCode}`}
      </div>
      <div style={{ height: '36px' }}>
        <select
          id="country-select"
          ref={selectRef}
          value={country?.dialCode}
          onChange={handleCountryCodeChange}
          className="form-control"
          style={{
            width: '120px',
            opacity: 0,
            position: 'absolute',
            left: 0,
            cursor: 'pointer',
          }}
        >
          {COUNTRY_CODES.map((country) => (
            <option key={country.code} value={country.dialCode}>
              {country.name} {country.emoji}
            </option>
          ))}
        </select>
      </div>

      <input
        className="form-control"
        type="tel"
        value={phoneNumber}
        onChange={handlePhoneNumberChange}
      />
    </div>
  );
};

export default PhoneInputWithCountryCode;
