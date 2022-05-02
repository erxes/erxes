import React from 'react';
import { __, CustomerSection } from '@erxes/ui/src';

export default ({ mainTypeId, mainType }) => {
  return (
    <CustomerSection
      title="Participant"
      mainType={mainType}
      mainTypeId={mainTypeId}
      relType="participant"
    />
  );
};
