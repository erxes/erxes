import { MutationHookOptions, OperationVariables } from '@apollo/client';

export interface IDepartment {
  _id: string;
  code: string;
  title: string;
  parentId?: string;
  order?: string;
  userCount?: number;
}

export interface ISelectDepartmentsContext {
  selectedDepartments: IDepartment[];
  setSelectedDepartments: (Departments: IDepartment[]) => void;
  value?: string[] | string;
  onSelect: (Departments: IDepartment) => void;
  newDepartmentName: string;
  setNewDepartmentName: (DepartmentName: string) => void;
  mode: 'single' | 'multiple';
  departmentIds?: string[];
}

export type ISelectDepartmentsProviderProps = {
  targetIds?: string[];
  value?: string[] | string;
  onValueChange?: (Departments?: string[] | string) => void;
  mode?: 'single' | 'multiple';
  departmentIds?: string[];
  children?: React.ReactNode;
  options?: (newSelectedDepartmentIds: string[]) => MutationHookOptions<
    {
      DepartmentsMain: {
        totalCount: number;
        list: IDepartment[];
      };
    },
    OperationVariables
  >;
};

export interface SelectDepartmentsProps {
  selected?: string[];
  onSelect?: (Departments: string[]) => void;
  loading?: boolean;
  recordId: string;
  fieldId?: string;
  showAddButton?: boolean;
  asTrigger?: boolean;
  display?: () => React.ReactNode;
  inDetail?: boolean;
}
