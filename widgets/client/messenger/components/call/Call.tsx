import * as React from 'react';

import Button from '../common/Button';
import Container from '../common/Container';
import CountrySelect from '../common/CountrySelect';
import { __ } from '../../../utils';

type Props = {
  setPhoneNumber: (phoneNumber: string) => void;
  setEmail: (email: string) => void;
  setIsCalling: (isCalling: boolean) => void;
  phoneNumber: string;
  email: string;
};

const Call: React.FC<Props> = ({
  setPhoneNumber,
  setEmail,
  setIsCalling,
  phoneNumber,
  email,
}) => {
  const isValidPhoneNumber = (phone: string) => {
    return phone.length >= 8 && /^[0-9]+$/.test(phone);
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const onContinue = () => {
    if (!isValidPhoneNumber(phoneNumber)) {
      return alert('Please enter a valid phone number with at least 8 digits.');
    }

    if (!isValidEmail(email)) {
      return alert('Please enter a valid email address.');
    }

    return setIsCalling(true);
  };

  return (
    <Container title={__('Call')} withBottomNavBar={false}>
      <div className="call-container">
        <div className="h-full flex flex-col justify-between">
          <div className="flex flex-col gap-4">
            <div className="detail-info">
              <h2>{__('Let’s Get You Connected')}</h2>
              <p>
                {__(
                  'We help your business grow by connecting you to your customers.',
                )}
              </p>
            </div>
            <div className="form-group">
              <label className="control-label" htmlFor="field-phone">
                Phone number
              </label>
              <div className="phone-input-wrapper form-control">
                <CountrySelect />
                <input
                  autoFocus
                  placeholder="Enter phone number"
                  type="number"
                  value={phoneNumber}
                  required
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="control-label" htmlFor="field-email">
                Email
              </label>
              <input
                className="form-control"
                placeholder="Enter your email"
                type="email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <Button full onClick={onContinue}>
            <span className="font-semibold">{__('Continue')}</span>
          </Button>
        </div>
      </div>
    </Container>
  );
};

export default Call;
