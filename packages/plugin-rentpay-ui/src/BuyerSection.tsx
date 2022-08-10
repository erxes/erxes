import * as path from 'path';

import React from 'react';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import { isEnabled } from '@erxes/ui/src/utils/core';

const CustomerSection = asyncComponent(
  () =>
    isEnabled('contacts') &&
    import(
      /* webpackChunkName: "CustomerSection" */ '@erxes/ui-contacts/src/customers/components/CustomerSection'
    )
);

const RenterSection = ({ mainTypeId, mainType }) => {
  if (isEnabled('contacts')) {
    return (
      <CustomerSection
        title="Buyers"
        mainType={mainType}
        mainTypeId={mainTypeId}
        relType="buyerCustomer"
      />
    );
  }

  return null;
};

export default RenterSection;
