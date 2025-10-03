import { ReactNode, createContext, useContext, useMemo } from 'react';
import {
  useDealsAdd,
  useDealsEdit,
  useDealsRemove,
} from '../cards/hooks/useDeals';

import { ISelectBoardsContext } from '../types/boards';
import { useConformityEdit } from '../cards/hooks/useConformity';

interface DealsContextType {
  addDeals: ReturnType<typeof useDealsAdd>['addDeals'];
  editDeals: ReturnType<typeof useDealsEdit>['editDeals'];
  removeDeals: ReturnType<typeof useDealsRemove>['removeDeals'];
  editConformity: ReturnType<typeof useConformityEdit>['editConformity'];
  loading: boolean;
  error: any;
}

const DealsContext = createContext<DealsContextType | undefined>(undefined);

export const DealsProvider = ({ children }: { children: ReactNode }) => {
  const { addDeals, loading: loadingAdd, error: errorAdd } = useDealsAdd();
  const { editDeals, loading: loadingEdit, error: errorEdit } = useDealsEdit();
  const {
    removeDeals,
    loading: loadingRemove,
    error: errorRemove,
  } = useDealsRemove();

  const {
    editConformity,
    loading: loadingEditConformity,
    error: errorEditConformity,
  } = useConformityEdit();

  const loading =
    loadingAdd || loadingEdit || loadingRemove || loadingEditConformity;
  const error = errorAdd || errorEdit || errorRemove || errorEditConformity;

  const value = useMemo(
    () => ({
      addDeals,
      editDeals,
      removeDeals,
      editConformity,
      loading,
      error,
    }),
    [addDeals, editDeals, removeDeals, editConformity, loading, error],
  );

  return (
    <DealsContext.Provider value={value}>{children}</DealsContext.Provider>
  );
};

export const useDealsContext = () => {
  const context = useContext(DealsContext);
  if (!context) {
    throw new Error('useDealsContext must be used within a DealsProvider');
  }
  return context;
};

export const SelectBoardsContext = createContext<ISelectBoardsContext | null>(
  null,
);

export const useSelectBoardsContext = () => {
  const context = useContext(SelectBoardsContext);
  if (!context) {
    throw new Error(
      'useSelectBoardsContext must be used within <SelectBoardsProvider>',
    );
  }
  return context;
};
