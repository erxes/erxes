import * as React from 'react';
import COUNTRIES from '../../../constants';

function CountrySelect() {
  const [currentCountryDialCode, setCurrentCountryDialCode] =
    React.useState('');
  return (
    <div>
      <select
        className="country-select"
        name="countries"
        id="countries"
        value={currentCountryDialCode}
        onChange={(event) => {
          setCurrentCountryDialCode(event.target.value);
        }}
      >
        {COUNTRIES.map((country) => (
          <option
            key={country.code}
            aria-label={country.name}
            aria-description={country.name}
            value={country.dialCode}
          >
            {`${country.emoji} ${country.dialCode}`}
          </option>
        ))}
      </select>
    </div>
  );
}

export default CountrySelect;
