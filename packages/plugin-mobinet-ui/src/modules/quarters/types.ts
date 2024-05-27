import { IDistrict } from './../districts/types';
import { QueryResponse } from '@erxes/ui/src/types';

export interface IQuarter {
  _id: string;
  name: string;
  code: string;
  center: any;
  districtId: string;
  cityId: string;
  district: IDistrict;
}

export type QuarterListQueryResponse = {
  quarterList: {
    list: IQuarter[];
    totalCount: number;
  };
  loading: boolean;
  refetch: () => void;
} & QueryResponse;

export type QuartersQueryResponse = {
  quarters: IQuarter[];
  loading: boolean;
  refetch: () => void;
} & QueryResponse;
