import GetConformity from '@erxes/ui-cards/src/conformity/containers/GetConformity';
import Box from '@erxes/ui/src/components/Box';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Spinner from '@erxes/ui/src/components/Spinner';
import { ICustomer } from '@erxes/ui/src/customers/types';
import { SectionBodyItem } from '@erxes/ui/src/layout/styles';
import { renderFullName, __ } from '@erxes/ui/src/utils/core';
import SelectCustomers from '@erxes/ui/src/customers/containers/SelectCustomers';

import React from 'react';
import { Link } from 'react-router-dom';

export type Props = {
  name: string;
  //   onSelect?: (customers: ICustomer[]) => void;
  actionSection?: any;
  title?: string;
  participants: any;
};

export default function Component({
  actionSection,
  participants,
  title = ''
}: Props) {
  //   const renderRelatedCustomerChooser = props => {
  //     return (
  //       <CustomerChooser
  //         {...props}
  //         data={{ name, customers: items, mainTypeId, mainType, isRelated: true }}
  //         onSelect={onSelect}
  //       />
  //     );
  //   };

  //   const relCustomerTrigger = (
  //     <ButtonRelated>
  //       <span>{__("See related customers..")}</span>
  //     </ButtonRelated>
  //   );

  //   const relQuickButtons = (
  //     <ModalTrigger
  //       title="Related Associate"
  //       trigger={relCustomerTrigger}
  //       size="lg"
  //       content={renderRelatedCustomerChooser}
  //     />
  //   );

  const renderActionSection = customer => {
    if (!actionSection) {
      return;
    }

    const ActionSection = actionSection;
    return <ActionSection customer={customer} isSmall={true} />;
  };

  const renderBody = participants => {
    const customersObj: ICustomer[] = participants.map(e => e.customer) || [];

    if (!customersObj) {
      return <Spinner objective={true} />;
    }
    return (
      <div>
        {customersObj.map((customer, index) => (
          <SectionBodyItem key={index}>
            <Link to={`/contacts/details/${customer._id}`}>
              {renderFullName(customer)}
            </Link>
            {renderActionSection(customer)}
          </SectionBodyItem>
        ))}
        {customersObj.length === 0 && (
          <EmptyState icon="user-6" text="No data" />
        )}
      </div>
    );
  };

  const customerChooser = props => {
    console.log(props);

    const onSelect = ids => {
      console.log(ids);
    };

    return (
      <>
        <SelectCustomers
          label="Filter by customers"
          name="customerIds"
          onSelect={onSelect}
        />
      </>
    );
  };

  const extraButtons = (
    <>
      <ModalTrigger
        title="Manage"
        size="lg"
        trigger={
          <button>
            <Icon icon="edit-3" />
          </button>
        }
        content={customerChooser}
      />
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
    </>
  );

  return (
    <Box
      title={__(`${title || 'Customers'}`)}
      extraButtons={extraButtons}
      isOpen={true}
      name="showCustomers"
    >
      {renderBody(participants)}
    </Box>
  );
}
