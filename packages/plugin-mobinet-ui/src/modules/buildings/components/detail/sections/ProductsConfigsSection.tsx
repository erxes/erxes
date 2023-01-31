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
import { IBuilding } from '../../../types';

type Props = {
  building: IBuilding;
  // collapseCallback?: () => void;
  // onSelectCustomers: (datas: any) => void;
};

const CustomerSection = (props: Props) => {
  const { building } = props;
  const { productPriceConfigs } = building;
  // const renderCustomerChooser = props => {
  //   return (
  //     <ContactChooser
  //       {...props}
  //       onSelect={onSelectCustomers}
  //       building={building}
  //       contacts={customers}
  //     />
  //   );
  // };

  // const renderRelatedCustomerChooser = props => {
  //   return (
  //     <ContactChooser
  //       {...props}
  //       contactType="customer"
  //       data={{
  //         name: 'Related customers',
  //         customers: [],
  //         isRelated: true
  //       }}
  //     />
  //   );
  // };

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

  // const quickButtons = (
  //   <ModalTrigger
  //     title="Add customer"
  //     trigger={customerTrigger}
  //     size="lg"
  //     content={renderCustomerChooser}
  //   />
  // );

  // const relQuickButtons = (
  //   <ModalTrigger
  //     title="Add related customer"
  //     trigger={relCustomerTrigger}
  //     size="lg"
  //     content={renderRelatedCustomerChooser}
  //   />
  // );

  const content = (
    <>
      {productPriceConfigs.map((productConfig, index) => (
        <SectionBodyItem key={index}>
          <span>{`${productConfig.product.name}: ${productConfig.price} ₮`}</span>
        </SectionBodyItem>
      ))}
      {productPriceConfigs.length === 0 && (
        <EmptyState icon="leaf" text="No products" />
      )}
      {/* {relQuickButtons} */}
    </>
  );

  return (
    <Box
      title={__('Product configs')}
      name="showProductConfigs"
      // extraButtons={quickButtons}
      isOpen={true}
      // callback={collapseCallback}
    >
      {content}
    </Box>
  );
};

export default CustomerSection;
