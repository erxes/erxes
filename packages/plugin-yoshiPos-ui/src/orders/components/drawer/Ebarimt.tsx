import React from 'react';

import { __ } from '../../../common/utils';
import Button from '../../../common/components/Button';
import { EbarimtButton } from '../kiosk/style';
import { FlexCenter } from '../../../common/styles/main';
import { BILL_TYPES } from './KioskPaymentForm';
import Icon from '../../../common/components/Icon';
import { SuccessfulText } from './style';

type Props = {
  billType: string;
  isPortrait: boolean | undefined;
  show: boolean;
  onBillTypeChange: (e: any) => void;
};

export default class Ebarimt extends React.Component<Props> {
  render() {
    const { isPortrait, onBillTypeChange, billType } = this.props;

    return (
      <>
        <SuccessfulText>
          <div className="icon-wrapper">
            <Icon icon="check-1" size={40} />
          </div>
          <h2 className="success">{__('Payment successful')}.</h2>
        </SuccessfulText>
        <FlexCenter>
          <h2>{__('Obtain a VAT receipt')}</h2>
        </FlexCenter>
        <EbarimtButton isPortrait={isPortrait}>
          <Button
            className={billType === BILL_TYPES.CITIZEN ? 'active' : ''}
            onClick={() => onBillTypeChange(BILL_TYPES.CITIZEN)}
            size="large"
          >
            {__('Person')}
          </Button>
          <Button
            className={billType === BILL_TYPES.ENTITY ? 'active' : ''}
            onClick={() => onBillTypeChange(BILL_TYPES.ENTITY)}
            size="large"
          >
            {__('Organization')}
          </Button>
        </EbarimtButton>
      </>
    );
  } // end render()
}
