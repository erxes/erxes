import React from 'react';

import { __ } from '../../../common/utils';
import Button from '../../../common/components/Button';
import { EbarimtButton } from '../kiosk/style';
import { BILL_TYPES } from '../../../constants';

type Props = {
  billType: string;
  isPortrait: boolean | undefined;
  show: boolean;
  onBillTypeChange: (e: any) => void;
  onStateChange: (key: string, value: any) => void;
  settlePayment: () => void;
};

export default class EntitySelector extends React.Component<Props> {
  render() {
    const {
      isPortrait,
      onBillTypeChange,
      billType,
      settlePayment
    } = this.props;

    const onClickCitizen = (type: string) => {
      onBillTypeChange(type);

      settlePayment();
    };

    return (
      <EbarimtButton isPortrait={isPortrait}>
        <Button
          className={billType === BILL_TYPES.CITIZEN ? 'active' : ''}
          onClick={() => onClickCitizen(BILL_TYPES.CITIZEN)}
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
    );
  } // end render()
}
