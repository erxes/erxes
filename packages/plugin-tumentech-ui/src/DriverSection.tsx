import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import { isEnabled } from '@erxes/ui/src/utils/core';
import React from 'react';

const CustomerSection = asyncComponent(
  () =>
    isEnabled('contacts') &&
    import(
      /* webpackChunkName: "CustomerSection" */ '@erxes/ui-contacts/src/customers/components/CustomerSection'
    )
);

export default ({ mainTypeId, mainType }) => {
  return (
    <CustomerSection
      title="Driver"
      mainType={mainType}
      mainTypeId={mainTypeId}
      relType="driver"
    />
  );
};
