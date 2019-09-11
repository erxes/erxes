import AddTrigger from 'modules/boards/components/portable/AddTrigger';
import React from 'react';
import options from '../options';

type Props = {
  customerIds?: string[];
};

export default (props: Props) => {
  const { customerIds } = props;

  const extendedProps = {
    options,
    relType: 'growthHack',
    relTypeIds: customerIds
  };

  return <AddTrigger {...extendedProps} />;
};
