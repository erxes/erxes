import { __, renderFullName } from '@erxes/ui/src/utils';

import Box from '@erxes/ui/src/components/Box';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Icon from '@erxes/ui/src/components/Icon';
import { Link } from 'react-router-dom';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';
import { SectionBodyItem } from '@erxes/ui/src/layout/styles';
import Spinner from '@erxes/ui/src/components/Spinner';
import { ICustomer } from '@erxes/ui-contacts/src/customers/types';
import ContactsForm from '../../containers/detail/ContactsForm';
import { IContract } from '../../types';

export type Props = {
  customers: ICustomer[];
  title?: string;
  contract: IContract;
};

function CustomerSection({ customers = [], title = '', contract }: Props) {
  const renderBody = (customersObj: ICustomer[]) => {
    if (!customersObj) {
      return <Spinner objective={true} />;
    }
    return (
      <div>
        {customersObj.map((customer) => (
          <SectionBodyItem key={customer._id}>
            <Link to={`/contacts/details/${customer._id}`}>
              {renderFullName(customer)}
            </Link>
          </SectionBodyItem>
        ))}
        {customersObj.length === 0 && (
          <EmptyState icon="user-6" text="No customer" />
        )}
      </div>
    );
  };

  const customerChooser = (props) => {
    return <ContactsForm {...props} contract={contract} />;
  };

  const extraButtons = (
    <ModalTrigger
      title="Associate"
      size="lg"
      trigger={
        <button>
          <Icon icon="plus-circle" />
        </button>
      }
      content={customerChooser}
    />
  );

  return (
    <Box
      title={__(`${title || 'Customers'}`)}
      extraButtons={extraButtons}
      isOpen={true}
      name="showCustomers"
    >
      {renderBody(customers)}
    </Box>
  );
}

export default CustomerSection;
