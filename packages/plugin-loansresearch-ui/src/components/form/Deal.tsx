import { __, ControlLabel, FormControl, FormGroup } from '@erxes/ui/src';
import React from 'react';
import Select from 'react-select';

import { CUSTOMER_TYPES } from '../../constants';
import { MarginTop } from '../../styles';

type Props = {
  dealId: string;
  customerId: string;
  setCustomerId: (dealId: string) => void;
  customerType: string;
  totalIncome: number;
  totalPaymentAmount: number;
  debtIncomeRatio: number;
  increaseMonthlyPaymentAmount: number;
};

const DealForm = (props: Props) => {
  const {
    dealId,
    customerId,
    setCustomerId,
    customerType,
    totalIncome,
    totalPaymentAmount,
    debtIncomeRatio,
    increaseMonthlyPaymentAmount,
  } = props;

  const onChangeCustomerId = (e) => {
    setCustomerId(e.target.value);
  };

  return (
    <MarginTop>
      <FormGroup>
        <ControlLabel>{'Deal'}</ControlLabel>
        <FormControl name="dealId" value={dealId} disabled={true} />
      </FormGroup>

      <FormGroup>
        <ControlLabel>{'Customer'}</ControlLabel>
        <FormControl
          name="customerId"
          value={customerId}
          onChange={onChangeCustomerId}
        />
      </FormGroup>

      <FormGroup>
        <ControlLabel>Customer type</ControlLabel>
        <Select
          value={CUSTOMER_TYPES.find((o) => o.value === customerType)}
          isDisabled={true}
          options={CUSTOMER_TYPES}
          isClearable={false}
        />
      </FormGroup>

      <FormGroup>
        <ControlLabel>Average income</ControlLabel>
        <FormControl type="number" defaultValue={totalIncome} disabled={true} />
      </FormGroup>

      <FormGroup>
        <ControlLabel>Monthly payment</ControlLabel>
        <FormControl
          type="number"
          defaultValue={totalPaymentAmount}
          disabled={true}
        />
      </FormGroup>

      <FormGroup>
        <ControlLabel>Dept income ratio</ControlLabel>
        <FormControl
          type="number"
          defaultValue={debtIncomeRatio}
          disabled={true}
        />
      </FormGroup>

      <FormGroup>
        <ControlLabel>Increase Monthly Payment Amount</ControlLabel>
        <FormControl
          type="number"
          defaultValue={increaseMonthlyPaymentAmount}
          disabled={true}
        />
      </FormGroup>
    </MarginTop>
  );
};

export default DealForm;
