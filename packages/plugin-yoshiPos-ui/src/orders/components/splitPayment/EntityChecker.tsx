import React from 'react';

import FormControl from '../../../common/components/form/Control';
import Icon from '../../../common/components/Icon';
import { BILL_TYPES } from '../../../constants';
import Button from '../../../common/components/Button';
import { __ } from '../../../common/utils';
import { IOrder } from '../../../orders/types';
import { ButtonGroup, EntityChecker, Input } from '../../../orders/styles';

type Props = {
  onStateChange: (key: string, value: any) => void;
  order: IOrder;
  registerNumber: string;
  checkOrganization: () => void;
  onBillTypeChange: (value: string) => void;
  settlePayment: () => void;
};

export default class EbarimtModal extends React.Component<Props> {
  render() {
    const {
      onStateChange,
      registerNumber,
      checkOrganization,
      onBillTypeChange,
      settlePayment
    } = this.props;

    const onClose = () => {
      onBillTypeChange(BILL_TYPES.CITIZEN);
      onStateChange('showEntity', false);
    };

    const onChange = e => {
      const value = (e.target as HTMLInputElement).value;

      onStateChange('registerNumber', value);
    };

    return (
      <React.Fragment>
        <h4>{__('Type register number')}</h4>
        <EntityChecker>
          <Input>
            <FormControl
              type="text"
              name="registerNumber"
              onChange={onChange}
              value={registerNumber}
              onFocus={() => onStateChange('activeInput', 'registerNumber')}
            />
            <div onClick={() => onStateChange('registerNumber', '')}>
              <Icon icon="cancel" size={13} />
            </div>
          </Input>
          <ButtonGroup>
            <Button
              btnStyle="warning"
              size="small"
              icon="check"
              onClick={() => checkOrganization()}
            >
              {__('Check')}
            </Button>
            {registerNumber && (
              <Button
                btnStyle="success"
                size="small"
                icon="print"
                onClick={() => settlePayment()}
              >
                {__('Print receipt')}
              </Button>
            )}
            <Button
              btnStyle="simple"
              icon="cancel-1"
              size="small"
              onClick={() => onClose()}
            >
              {__('Back')}
            </Button>
          </ButtonGroup>
        </EntityChecker>
      </React.Fragment>
    );
  }
}
