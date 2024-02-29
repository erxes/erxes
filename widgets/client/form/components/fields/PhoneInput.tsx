import * as React from 'react';
import { COUNTRY_CODES } from '../../constants';
import { FieldValue } from '../../types';
import { connection } from '../../connection';
import { ICountry } from '../../../types';

type Props = {
  id?: string;
  value?: string;
  onChange: (value: FieldValue) => void;
};

const PhoneInputWithCountryCode = (props: Props) => {
  const { onChange } = props;

  const [country, setCountry] = React.useState<ICountry | null>(() => {
    if (connection.browserInfo) {
      const countryCode = connection.browserInfo.countryCode;
      return (
        COUNTRY_CODES.find((country) => country.code === countryCode) || null
      );
    }
    return COUNTRY_CODES[0];
  });

  const [phoneNumber, setPhoneNumber] = React.useState('');

  React.useEffect(() => {
    if (connection.browserInfo) {
      const countryCode = connection.browserInfo.countryCode;
      const result = COUNTRY_CODES.find((c) => c.code === countryCode);
      if (result) {
        setCountry(result);
      }
    }
  }, [connection.browserInfo]);

  const handleCountryCodeChange = (e: any) => {
    const countryCode = e.target.value;
    const selectedCountry = COUNTRY_CODES.find((c) => c.code === countryCode);
    if (selectedCountry) {
      setCountry(selectedCountry);
    }
    // Pass the country code and phone number to the parent component
    onChange(`${selectedCountry?.dialCode}${phoneNumber}`);
  };

  const handlePhoneNumberChange = (e: any) => {
    setPhoneNumber(e.target.value);
    // Pass the country code and phone number to the parent component
    onChange(`${country?.dialCode}${e.target.value}`);
  };

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
          value={country?.code}
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
            <option key={country.code} value={country.code}>
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
