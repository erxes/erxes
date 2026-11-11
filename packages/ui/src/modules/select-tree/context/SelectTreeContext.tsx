import { createContext, useContext } from 'react';

import { ISelectTreeContext } from 'erxes-ui/modules/select-tree/types/selectTreeTypes';

export const SelectTreeContext = createContext<ISelectTreeContext | null>(null);

export const useSelectTreeContext = () => {
  const context = useContext(SelectTreeContext);
  if (!context) {
    throw new Error(
      'useSelectTreeContext must be used within a SelectTreeProvider'
    );
  }
  return context;
};
