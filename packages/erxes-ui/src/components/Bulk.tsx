import React, { useState } from 'react';

import toggleCheckBoxes from '../utils/toggleCheckBoxes';

export interface IBulkContentProps {
  isAllSelected: boolean;
  bulk: any[];
  emptyBulk: () => void;
  toggleBulk: (target: any, toAdd: boolean) => void;
  toggleAll: (targets: any[], containerId: string) => void;
}

type Props = {
  content: (props: IBulkContentProps) => React.ReactNode;
  refetch?: () => void;
};

const Bulk: React.FC<Props> = (props) => {
  const { content, refetch } = props;
  const [bulk, setBulk] = useState<string[]>([]);
  const [isAllSelected, setIsAllSelected] = useState<boolean>(false);

  const toggleBulk = (target: any, toAdd: boolean) => {
    setBulk((prevBulk) => {
      let updatedBulk = prevBulk.filter((el: any) => el._id !== target._id);
      if (toAdd) {
        updatedBulk.push(target);
      }
      return updatedBulk;
    });
  };

  const toggleAll = (targets: any[], containerId: string) => {
    if (isAllSelected) {
      emptyBulk();
    } else {
      setBulk(targets);
    }

    toggleCheckBoxes(containerId, !isAllSelected);
    setIsAllSelected(!isAllSelected);
  };

  const emptyBulk = () => {
    if (refetch) {
      refetch();
    }
    setBulk([]);
    setIsAllSelected(false);
  };

  return content({
    bulk,
    isAllSelected,
    emptyBulk,
    toggleBulk,
    toggleAll,
  });
};

export default Bulk;
