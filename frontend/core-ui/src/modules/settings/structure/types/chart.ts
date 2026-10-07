export interface IChartSupervisor {
  _id: string;
  details?: {
    fullName?: string | null;
    avatar?: string | null;
  } | null;
}

export interface IStructureChartItem {
  _id: string;
  title?: string | null;
  code?: string | null;
  parentId?: string | null;
  order?: string | null;
  status?: string | null;
  userCount?: number | null;
  userIds?: string[] | null;
  supervisorId?: string | null;
  supervisor?: IChartSupervisor | null;
}

export interface IStructureChartUnit {
  _id: string;
  title?: string | null;
  code?: string | null;
  departmentId?: string | null;
  userCount?: number | null;
  userIds?: string[] | null;
  supervisorId?: string | null;
  supervisor?: IChartSupervisor | null;
}

export type StructureChartView = 'departments' | 'branches' | 'positions';
