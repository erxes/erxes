import * as React from 'react';

type Props = {
  field: any;
  otherFields: any[];
  onClick?: (field: any) => void;
  onChangeLocationOptions?: (locationOptions: any[]) => void;
};

const PhoneInputWithCountryCode = (props: any) => {
  const { onChange } = props;
  const [countryCode, setCountryCode] = React.useState('US'); // State for the country code
  const [phoneNumber, setPhoneNumber] = React.useState(''); // State for the phone number
  const [showDropdown, setShowDropdown] = React.useState(false);
  const selectRef:any = React.createRef();

  const handleCountryCodeChange = (e: any) => {
    setCountryCode(e.target.value);

    // Pass the country code and phone number to the parent component
    onChange({
      target: {
        value: `+${e.target.value}${phoneNumber}`,
      },
    });
  };

  const handlePhoneNumberChange = (e: any) => {
    setPhoneNumber(e.target.value);

    // Pass the country code and phone number to the parent component
    onChange({
      target: {
        value: `+${countryCode}${e.target.value}`,
      },
    });
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);

    if (!showDropdown && selectRef.current) {
      // Focus on the select element to enable keyboard navigation
      console.log(selectRef.current);
      (selectRef.current as any).click();
    }
  };

  const countryCodes = [
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    // Add more countries as needed
  ];

  const flag = countryCodes.find((country) => country.code === countryCode)?.flag;

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div className="dropdown-header" onClick={toggleDropdown}>
        {countryCodes.find((country) => country.code === countryCode)?.flag}{' '}
      </div>

      <select
        id="country-select"
        ref={selectRef}
        value={countryCode}
        onChange={handleCountryCodeChange}
        className="form-control"

        // style={{ display: showDropdown ? 'block' : 'none' }}
      >
        {countryCodes.map((country) => (
          <option key={country.code} value={country.code}>
            {country.flag} (+{country.code})
          </option>
        ))}
      </select>

      <input
        className="form-control"
        type="tel"
        value={phoneNumber}
        onChange={handlePhoneNumberChange}
        placeholder="1234567890" // Set a default placeholder or leave it empty
      />
    </div>
  );
};

export default PhoneInputWithCountryCode;
