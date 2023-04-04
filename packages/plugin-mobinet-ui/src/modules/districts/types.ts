import { QueryResponse } from '@erxes/ui/src/types';
import { ICity } from '../cities/types';

export interface IDistrict {
  _id: string;
  name: string;
  code: string;
  center: any;
  cityId: string;
  city: ICity;
  isCapital: boolean;
}

export type DistrictsListQueryResponse = {
  districtList: {
    list: IDistrict[];
    totalCount: number;
  };
  loading: boolean;
  refetch: () => void;
} & QueryResponse;

export type DistrictsQueryResponse = {
  districts: IDistrict[];
  loading: boolean;
  refetch: () => void;
} & QueryResponse;
