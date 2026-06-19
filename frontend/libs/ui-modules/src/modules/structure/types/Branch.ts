import { MutationHookOptions, OperationVariables } from '@apollo/client';

export interface IBranch {
  _id: string;
  title: string;
  code: string;
  parentId?: string;
  order: string;
  userCount?: number;
}

export interface ISelectBranchesContext {
  selectedBranches: IBranch[];
  setSelectedBranches: (Branches: IBranch[]) => void;
  value?: string[] | string;
  onSelect: (Branches: IBranch) => void;
  newBranchName: string;
  setNewBranchName: (BranchName: string) => void;
  mode: 'single' | 'multiple';
  branchIds?: string[];
}

export type ISelectBranchesProviderProps = {
  targetIds?: string[];
  value?: string[] | string;
  onValueChange?: (Branches?: string[] | string) => void;
  mode?: 'single' | 'multiple';
  branchIds?: string[];
  children?: React.ReactNode;
  options?: (newSelectedBranchIds: string[]) => MutationHookOptions<
    {
      BranchesMain: {
        totalCount: number;
        list: IBranch[];
      };
    },
    OperationVariables
  >;
};

export interface SelectBranchesProps {
  selected?: string[];
  onSelect?: (Branches: string[]) => void;
  loading?: boolean;
  recordId: string;
  fieldId?: string;
  showAddButton?: boolean;
  asTrigger?: boolean;
  display?: () => React.ReactNode;
  inDetail?: boolean;
}
