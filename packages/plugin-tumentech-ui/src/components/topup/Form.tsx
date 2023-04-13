import SelectCustomers from '@erxes/ui-contacts/src/customers/containers/SelectCustomers';
import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React, { useState } from 'react';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

const PlaceForm = (props: Props) => {
  const [customerId, setCustomerId] = useState('');
  const [amount, setAmount] = useState(0);

  const generateDoc = () => {
    const finalValues: any = {};

    finalValues.customerId = customerId;
    finalValues.amount = Number(amount);

    return {
      ...finalValues
    };
  };

  const onChangeInput = e => {
    setAmount(e.target.value);
  };

  const onSelect = id => {
    setCustomerId(id);
  };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton } = props;
    const { isSubmitted } = formProps;

    return (
      <>
        <FormGroup>
          <ControlLabel>Customer</ControlLabel>
          <SelectCustomers
            label="Customer"
            name="customer"
            multi={false}
            onSelect={onSelect}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Amount</ControlLabel>
          <FormControl
            {...formProps}
            id="amount"
            name="amount"
            type="number"
            required={true}
            defaultValue={amount}
            onChange={onChangeInput}
          />
        </FormGroup>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="times-circle">
            Close
          </Button>

          {renderButton({
            name: 'topups',
            values: generateDoc(),
            isSubmitted,
            callback: closeModal
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default PlaceForm;
