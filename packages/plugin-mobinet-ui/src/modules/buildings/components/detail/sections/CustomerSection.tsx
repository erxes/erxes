import {
  __,
  EmptyState,
  Icon,
  ModalTrigger,
  SectionBodyItem,
} from '@erxes/ui/src';
import Box from '@erxes/ui/src/components/Box';
import { ButtonRelated } from '@erxes/ui/src/styles/main';
import React from 'react';
import { Link } from 'react-router-dom';

import ContactChooser from '../../../containers/ContactChooser';
import { IBuilding } from '../../../types';

type Props = {
  building: IBuilding;
  collapseCallback?: () => void;
};

const CustomerSection = (props: Props) => {
  const { building, collapseCallback } = props;
  const { customers } = building;
  const renderCustomerChooser = (props) => {
    return (
      <ContactChooser
        {...props}
        contacts={customers}
      />
    );
  };

  const renderRelatedCustomerChooser = (props) => {
    return (
      <ContactChooser
        {...props}
        contactType="customer"
        data={{
          name: 'Related customers',
          customers: [],
          isRelated: true,
        }}
      />
    );
  };

  const customerTrigger = (
    <button>
      <Icon icon="plus-circle" />
    </button>
  );

  const relCustomerTrigger = (
    <ButtonRelated>
      <span>{__('See related customers..')}</span>
    </ButtonRelated>
  );

  const quickButtons = (
    <ModalTrigger
      title="Add customer"
      trigger={customerTrigger}
      size="lg"
      content={renderCustomerChooser}
    />
  );

  const relQuickButtons = (
    <ModalTrigger
      title="Add related customer"
      trigger={relCustomerTrigger}
      size="lg"
      content={renderRelatedCustomerChooser}
    />
  );

  const content = (
    <>
      {customers.map((customer, index) => (
        <SectionBodyItem key={index}>
          <Link to={`/erxes-plugin-tumentech/car/details/${customer._id}`}>
            {/* <Icon icon="arrow-to-right" /> */}
          </Link>
          <span>{customer.firstName || 'Unknown'}</span>
        </SectionBodyItem>
      ))}
      {customers.length === 0 && <EmptyState icon="building" text="No residents" />}
      {relQuickButtons}
    </>
  );

  return (
    <Box
      title={__('Residents')}
      name="showCustomers"
      extraButtons={quickButtons}
      isOpen={true}
      callback={collapseCallback}
    >
      {content}
    </Box>
  );
};

export default CustomerSection;
