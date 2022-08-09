import * as path from 'path';

import React from 'react';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import { isEnabled } from '@erxes/ui/src/utils/core';

const CustomerSection = asyncComponent(
  () =>
    isEnabled('contacts') &&
    path.resolve(
      /* webpackChunkName: "CustomerSection" */ '@erxes/ui-contacts/src/customers/components/CustomerSection'
    )
);

const RenterSection = ({ mainTypeId, mainType }) => {
  if (isEnabled('contacts')) {
    return (
      <CustomerSection
        title="Waiters"
        mainType={mainType}
        mainTypeId={mainTypeId}
        relType="waiterCustomer"
      />
    );
  }

  return null;
};

export default RenterSection;
