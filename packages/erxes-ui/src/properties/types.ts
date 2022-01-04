import { QueryResponse } from '../types';

// query types
export type FieldsCombinedByType = {
  _id: string;
  name: string;
  label: string;
  brandName: string;
  brandId: string;
};

export type FieldsCombinedByTypeQueryResponse = {
  fieldsCombinedByContentType: FieldsCombinedByType[];
} & QueryResponse;