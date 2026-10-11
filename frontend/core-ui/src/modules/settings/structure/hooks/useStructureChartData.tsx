import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  GET_STRUCTURE_CHART_BRANCHES,
  GET_STRUCTURE_CHART_DEPARTMENTS,
  GET_STRUCTURE_CHART_POSITIONS,
  GET_STRUCTURE_CHART_UNITS,
} from '../graphql/queries/getStructureChart';
import {
  IStructureChartItem,
  IStructureChartUnit,
  StructureChartView,
} from '../types/chart';

interface ChartItemsResult {
  items: IStructureChartItem[];
  loading: boolean;
  error?: { message: string };
  refetch: () => void;
}

const useChartQuery = (
  query:
    | typeof GET_STRUCTURE_CHART_DEPARTMENTS
    | typeof GET_STRUCTURE_CHART_BRANCHES
    | typeof GET_STRUCTURE_CHART_POSITIONS,
  field: 'departments' | 'branches' | 'positions',
  options?: QueryHookOptions,
): ChartItemsResult => {
  const { data, loading, error, refetch } = useQuery<
    Record<string, IStructureChartItem[]>
  >(query, options);

  return {
    items: data?.[field] || [],
    loading,
    error,
    refetch: () => {
      refetch();
    },
  };
};

export const useChartDepartments = (options?: QueryHookOptions) =>
  useChartQuery(GET_STRUCTURE_CHART_DEPARTMENTS, 'departments', options);

export const useChartBranches = (options?: QueryHookOptions) =>
  useChartQuery(GET_STRUCTURE_CHART_BRANCHES, 'branches', options);

export const useChartPositions = (options?: QueryHookOptions) =>
  useChartQuery(GET_STRUCTURE_CHART_POSITIONS, 'positions', options);

export const useChartUnits = (options?: QueryHookOptions) => {
  const { data, loading, error, refetch } = useQuery<{
    units: IStructureChartUnit[];
  }>(GET_STRUCTURE_CHART_UNITS, options);

  return {
    units: data?.units || [],
    loading,
    error,
    refetch: () => {
      refetch();
    },
  };
};

export const useStructureChartItems = (
  view: StructureChartView,
): ChartItemsResult => {
  const departments = useChartDepartments({ skip: view !== 'departments' });
  const branches = useChartBranches({ skip: view !== 'branches' });
  const positions = useChartPositions({ skip: view !== 'positions' });

  if (view === 'departments') return departments;
  if (view === 'branches') return branches;
  return positions;
};
