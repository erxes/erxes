import { ControlLabel, FormControl, FormGroup } from '@erxes/ui/src';
import React from 'react';
import Select from 'react-select';

import { CUSTOMER_TYPES } from '../../constants';
import { MarginTop } from '../../styles';
import { renderBody } from '../../utils';

type Props = {
  customerData: any;
  dealData: any;
  customerType: string;
  totalIncome: number;
  totalPaymentAmount: number;
  debtIncomeRatio: number;
  increaseMonthlyPaymentAmount: number;
};

const DealForm = (props: Props) => {
  const {
    customerData,
    dealData,
    customerType,
    totalIncome,
    totalPaymentAmount,
    debtIncomeRatio,
    increaseMonthlyPaymentAmount,
  } = props;

  return (
    <MarginTop>
      <FormGroup>
        <ControlLabel>{'Deal'}</ControlLabel>
        {renderBody(dealData, 'deal')}
      </FormGroup>

      <FormGroup>
        <ControlLabel>{'Customer'}</ControlLabel>
        {renderBody(customerData)}
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
        <FormControl
          type="number"
          value={totalIncome}
          disabled={true}
          useNumberFormat={true}
          fixed={2}
        />
      </FormGroup>

      <FormGroup>
        <ControlLabel>Monthly payment</ControlLabel>
        <FormControl
          type="number"
          value={totalPaymentAmount}
          disabled={true}
          useNumberFormat={true}
          fixed={2}
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
          value={increaseMonthlyPaymentAmount}
          disabled={true}
          useNumberFormat={true}
          fixed={2}
        />
      </FormGroup>
    </MarginTop>
  );
};

export default DealForm;
