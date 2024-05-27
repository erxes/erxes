import {
  __,
  EmptyState,
  Icon,
  ModalTrigger,
  SectionBodyItem,
} from '@erxes/ui/src';
import Box from '@erxes/ui/src/components/Box';
import { ButtonRelated } from '@erxes/ui/src/styles/main';
import { renderFullName } from '@erxes/ui/src/utils/core';
import React from 'react';
import { Link } from 'react-router-dom';

import ContactChooser from '../../../containers/ContactChooser';
import { InsuranceItem } from '../../../../../gql/types';

type Props = {
  item: InsuranceItem;
  collapseCallback?: () => void;
  onSelectCustomers: (datas: any) => void;
};

const CustomerSection = (props: Props) => {
  const { item, collapseCallback, onSelectCustomers } = props;
  const { customer } = item;
  const renderCustomerChooser = (props) => {
    return (
      <ContactChooser
        {...props}
        onSelect={onSelectCustomers}
        item={item}
        contacts={[customer]}
      />
    );
  };

  const renderRelatedCustomerChooser = (props) => {
    return (
      <ContactChooser
        {...props}
        contactType="customer"
        data={{
          name: 'Related customer',
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
      {!item.customer ? (
        <EmptyState icon="user" text="No customers" />
      ) : (
        <SectionBodyItem>
          <Link to={`/contacts/details/${customer?._id}`}>
            <span>{renderFullName(customer)}</span>
          </Link>
        </SectionBodyItem>
      )}
      {/* {relQuickButtons} */}
    </>
  );

  return (
    <Box
      title={__('Customer')}
      name="showCustomers"
      // extraButtons={quickButtons}
      isOpen={true}
      callback={collapseCallback}
    >
      {content}
    </Box>
  );
};

export default CustomerSection;
