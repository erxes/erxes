import { createContext, useContext } from 'react';
import type { GetProjectsInlineQuery } from '~/gql/graphql';

export type IProjectOption = NonNullable<
  NonNullable<
    NonNullable<GetProjectsInlineQuery['getProjects']>['list']
  >[number]
>;

interface SelectProjectContextType {
  value?: string | null;
  onValueChange: (value: string) => void;
  projects: IProjectOption[];
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
