import AddTrigger from 'modules/boards/components/portable/AddTrigger';
import React from 'react';
import options from '../options';

type Props = {
  relType: string;
  relTypeIds?: string[];
  assignedUserIds?: string[];
};

export default (props: Props) => {
  const { relType, relTypeIds, assignedUserIds } = props;

  return (
    <AddTrigger
      options={options}
      relTypeIds={relTypeIds}
      relType={relType}
      assignedUserIds={assignedUserIds}
    />
  );
};
