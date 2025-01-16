import { __, ControlLabel, FormControl, FormGroup } from '@erxes/ui/src';
import React from 'react';
import Select from 'react-select';

import { CUSTOMER_TYPES } from '../../constants';
import { MarginTop } from '../../styles';

type Props = {
  dealId: string;
  setDealId: (dealId: string) => void;
  customerId: string;
  setCustomerId: (dealId: string) => void;
  customerType: string;
  setCustomerType: (dealId: string) => void;
};

const DealForm = (props: Props) => {
  const {
    dealId,
    setDealId,
    customerId,
    setCustomerId,
    customerType,
    setCustomerType,
  } = props;

  const onChangeDealId = (e) => {
    setDealId(e.target.value);
  };

  const onChangeCustomerId = (e) => {
    setCustomerId(e.target.value);
  };

  const onCustomerTypeChange = (option) => {
    setCustomerType(option.value);
  };

  return (
    <MarginTop>
      <FormGroup>
        <ControlLabel>{'Deal'}</ControlLabel>
        <FormControl name="dealId" onChange={onChangeDealId} value={dealId} />
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
          onChange={onCustomerTypeChange}
          options={CUSTOMER_TYPES}
          isClearable={false}
        />
      </FormGroup>
    </MarginTop>
  );
};

export default DealForm;
