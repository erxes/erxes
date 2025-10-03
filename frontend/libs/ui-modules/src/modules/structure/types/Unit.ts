import { MutationHookOptions, OperationVariables } from '@apollo/client';

export interface IUnit {
  _id: string;
  title: string;
  code: string;
  userCount?: number;
}

export interface IUnitsMain {
  list: IUnit[];
  totalCount: number | undefined;
  totalUsersCount: number | undefined;
}

export interface ISelectUnitContext {
  selectedUnit: IUnit | undefined;
  setSelectedUnit: (unit: IUnit) => void;
  value?: string;
  onSelect: (unit: IUnit) => void;
  newUnitName: string;
  setNewUnitName: (unitName: string) => void;
}

export type ISelectUnitProviderProps = {
  value?: string;
  onValueChange?: (unit?: string) => void;
  children: React.ReactNode;
  options?: (newSelectedUnit: string) => MutationHookOptions<
    {
      unitsMain: {
        totalCount: number;
        list: IUnit[];
      };
    },
    OperationVariables
  >;
};

export interface SelectUnitProps {
  selected?: string;
  onSelect?: (unit: string) => void;
  loading?: boolean;
  recordId: string;
  fieldId?: string;
  showAddButton?: boolean;
  asTrigger?: boolean;
  display?: () => React.ReactNode;
  inDetail?: boolean;
}
