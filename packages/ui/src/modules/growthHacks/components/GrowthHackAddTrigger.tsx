import AddTrigger from 'modules/boards/components/portable/AddTrigger';
import React from 'react';
import options from '../options';

type Props = {
  customerIds?: string[];
  refetch?: () => void;
};

export default (props: Props) => {
  const { customerIds, refetch } = props;

  const extendedProps = {
    options,
    refetch,
    relType: 'growthHack',
    relTypeIds: customerIds
  };

  return <AddTrigger {...extendedProps} />;
};
