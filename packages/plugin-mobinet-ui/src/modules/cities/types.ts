import { QueryResponse } from '@erxes/ui/src/types';

export interface ICenter {
  lat: number;
  lng: number;
}

export interface ICity {
  _id: string;
  code: string;
  name: string;
  center: ICenter;
  iso: string;
  stat: string;
}

export type CityListQueryResponse = {
  cityList: {
    list: ICity[];
    totalCount: number;
  };

  loading: boolean;
  refetch: () => void;
} & QueryResponse;

export type CitiesQueryResponse = {
  cities: ICity[];
  loading: boolean;
  refetch: () => void;
} & QueryResponse;

export type CityByCoordinateQueryResponse = {
  cityByCoordinates: ICity;
  loading: boolean;
  refetch: () => void;
} & QueryResponse;
