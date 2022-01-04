import { IUser } from '@erxes/ui/src/auth/types';
import { QueryResponse } from '@erxes/ui/src/types';

export type FieldsCombinedByType = {
  _id: string;
  name: string;
  label: string;
  brandName?: string;
  brandId?: string;
  type: string;
  selectOptions?: any[];
  order?: number;
  group?: string;
  options?: string[];
  title?: string;
};

export type FieldsCombinedByTypeQueryResponse = {
  fieldsCombinedByContentType: FieldsCombinedByType[];
} & QueryResponse;
