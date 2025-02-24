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

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  contract: IContract;
  closeModal: () => void;
};

function RelCustomersForm(props: Props) {
  const { contract } = props;
  const [relCustomers, setRelCustomers] = useState<
    { customerId: string; customerType: string }[]
  >(contract?.relCustomers || []);

  const generateDoc = (values: { _id: string } & IContractDoc) => {
    const result = {
      ...contract,
      ...values,
      relCustomers,
    };

    return result;
  };

  const onSelectCustomer = (selectedCustomerId: string | string[]) => {
    let data;

    if (Array.isArray(selectedCustomerId)) {
      data = selectedCustomerId.map((cId) => ({
        customerId: cId,
        customerType: 'customer',
      }));
    } else {
      data = {
        customerId: selectedCustomerId,
        customerType: 'customer',
      };
    }

    setRelCustomers(data);
  };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton } = props;
    const { values, isSubmitted } = formProps;

    return (
      <>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel>{__('RelCustomers')}</ControlLabel>
              <SelectCustomers
                label={__('Choose relCustomers')}
                name="customerId"
                initialValue={relCustomers?.map((relC) => relC.customerId)}
                onSelect={(selectedId: string | string[]) =>
                  onSelectCustomer(selectedId)
                }
                multi={true}
              />
            </FormGroup>
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

export default RelCustomersForm;
