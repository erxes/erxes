import * as React from 'react';
import Button from './common/Button';
import CountrySelect from './common/CountrySelect';
import Container from './common/Container';
import { __ } from '../../utils';

type Props = {
  isSubmitted?: boolean;
  handleSubmit?: () => void;
};

const Call: React.FC<Props> = () => {
  return (
    <Container title={__('Call')} withBottomNavBar={false}>
      <div className="call-container">
        <div className="h-full flex flex-col justify-between">
          <div className="flex flex-col gap-4">
            <div className="detail-info">
              <h2>{__('What’s your mobile phone number')}</h2>
              <p>
                {__(
                  'We help you business grow by connecting you to your customers.'
                )}
              </p>
            </div>
            <div className="phone-input-wrapper">
              <CountrySelect />
              <input autoFocus placeholder="(201) 555-0123" />
            </div>
          </div>
          <Button full>
            <span className="font-semibold">{__('Continue')}</span>
          </Button>
        </div>
      </div>
    </Container>
  );
};

export default Call;
