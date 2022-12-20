import { IBranch, IDepartment } from '@erxes/ui/src/team/types';
import { ISPLabel } from '../settings/types';

export interface IPlanValues {
  [key: string]: number;
}

export interface IDayLabel {
  _id: string;
  date?: Date;
  departmentId?: string;
  branchId?: string;
  labelIds?: string[];
  createdAt?: Date;
  createdBy?: string;
  modifiedAt?: Date;
  modifiedBy?: string;

  branch?: IBranch;
  department?: IDepartment;
  labels?: ISPLabel[];
}

export interface IDayLabelParams {
  dates?: string[];
  departmentIds?: string[];
  branchIds?: string[];
  labelIds?: string[];
}

export type DayLabelsQueryResponse = {
  dayLabels: IDayLabel[];
  loading: boolean;
  refetch: () => void;
};

export type DayLabelsCountQueryResponse = {
  dayLabelsCount: number;
  loading: boolean;
  refetch: () => void;
};

export type DayLabelsRemoveMutationResponse = {
  dayLabelsRemove: (mutation: {
    variables: { _ids: string[] };
  }) => Promise<any>;
};

export type DayLabelsEditMutationResponse = {
  dayLabelEdit: (mutation: { variables: IDayLabel }) => Promise<any>;
};
