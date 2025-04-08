import SelectCustomers from '@erxes/ui-contacts/src/customers/containers/SelectCustomers';
import Button from '@erxes/ui/src/components/Button';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import {
  MainStyleFormColumn as FormColumn,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter,
} from '@erxes/ui/src/styles/eindex';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { __ } from 'coreui/utils';
import React, { useState } from 'react';
import { IContract, IContractDoc } from '../../types';
import SelectCompanies from '@erxes/ui-contacts/src/companies/containers/SelectCompanies';
import FormControl from '@erxes/ui/src/components/form/Control';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  contract: IContract;
  closeModal: () => void;
};

function ContactsForm(props: Props) {
  const { contract } = props;
  const [customerId, setCustomerId] = useState(contract?.customerId || '');
  const [customerType, setCustomerType] = useState(
    contract?.customerType || ''
  );

  const generateDoc = (values: { _id: string } & IContractDoc) => {
    const result = {
      ...contract,
      ...values,
      customerId,
      customerType,
    };

    return result;
  };

  const onSelectCustomer = (value) => {
    setCustomerId(value);
  };

  const onCheckCustomerType = (isChecked) => {
    setCustomerType(isChecked ? 'company' : 'customer');
  };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton } = props;
    const { values, isSubmitted } = formProps;

    return (
      <>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel>{__('Is Organization')}</ControlLabel>
              <FormControl
                className="flex-item"
                type="checkbox"
                componentclass="checkbox"
                name="customerType"
                checked={customerType === 'company'}
                onChange={(e: any) => onCheckCustomerType(e.target.checked)}
              />
            </FormGroup>

            {(customerType === 'customer' && (
              <FormGroup>
                <ControlLabel>{__('Customer')}</ControlLabel>
                <SelectCustomers
                  label={__('Choose Customer')}
                  name="customerId"
                  initialValue={customerId}
                  onSelect={onSelectCustomer}
                  multi={false}
                />
              </FormGroup>
            )) || (
              <FormGroup>
                <ControlLabel>{__('Company')}</ControlLabel>
                <SelectCompanies
                  label={__('Choose Company')}
                  name="customerId"
                  initialValue={customerId}
                  onSelect={onSelectCustomer}
                  multi={false}
                />
              </FormGroup>
            )}
          </FormColumn>
        </FormWrapper>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            {__('Close')}
          </Button>

          {renderButton({
            name: 'contract',
            values: generateDoc(values),
            isSubmitted,
            object: props.contract,
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
}

export default ContactsForm;
