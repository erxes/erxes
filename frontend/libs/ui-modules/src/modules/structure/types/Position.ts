import { MutationHookOptions, OperationVariables } from '@apollo/client';

export interface IPosition {
  _id: string;
  code: string;
  title: string;
  order: string;
  parentId?: string;
  children?: {
    _id: string;
    code: string;
    title: string;
    userCount: number;
  };
  status?: string;
  userCount?: number;
}

export interface ISelectPositionsContext {
  selectedPositions: IPosition[];
  setSelectedPositions: (positions: IPosition[]) => void;
  value?: string[] | string;
  onSelect: (positions: IPosition) => void;
  newPositionName: string;
  setNewPositionName: (positionName: string) => void;
  mode: 'single' | 'multiple';
  positionIds?: string[];
}

export type ISelectPositionsProviderProps = {
  targetIds?: string[];
  value?: string[] | string;
  onValueChange?: (positions?: string[] | string) => void;
  mode?: 'single' | 'multiple';
  positionIds?: string[];
  children: React.ReactNode;
  options?: (newSelectedPositionIds: string[]) => MutationHookOptions<
    {
      positionsMain: {
        totalCount: number;
        list: IPosition[];
      };
    },
    OperationVariables
  >;
};

export interface SelectPositionsProps {
  selected?: string[];
  onSelect?: (positions: string[]) => void;
  loading?: boolean;
  recordId: string;
  fieldId?: string;
  showAddButton?: boolean;
  asTrigger?: boolean;
  display?: () => React.ReactNode;
  inDetail?: boolean;
}
