import { createContext, useContext } from 'react';

interface SelectProjectContextType {
  value?: string;
  onValueChange: (value: string) => void;
  projects: {
    _id: string;
    name: string;
    status: number;
  }[];
  handleFetchMore: () => void;
  totalCount?: number;
  search?: string;
  setSearch?: (search: string) => void;
  variant?: string;
}

export const SelectProjectContext = createContext<
  SelectProjectContextType | undefined
>(undefined);

export const useSelectProjectContext = () => {
  const context = useContext(SelectProjectContext);
  if (!context) {
    throw new Error(
      'useSelectProjectContext must be used within a SelectProjectProvider',
    );
  }
  return context;
};
