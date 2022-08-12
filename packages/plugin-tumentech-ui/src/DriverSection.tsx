import { CustomerSection } from '@erxes/ui/src';
import React from 'react';

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
