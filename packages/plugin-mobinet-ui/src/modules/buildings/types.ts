import { ITicket } from '@erxes/ui-cards/src/tickets/types';
import { ICompany } from '@erxes/ui-contacts/src/companies/types';
import { ICustomer } from '@erxes/ui-contacts/src/customers/types';
import { QueryResponse } from '@erxes/ui/src/types';

import { IQuarter } from '../quarters/types';

export interface IOSMBuilding {
  id: string;
  properties: {
    name?: string;
    bounds: {
      min: [number, number];
      max: [number, number];
    };
  };
}

export interface IBuilding {
  _id: string;
  code: string;
  name: string;
  serviceStatus: string;
  color: string;
  bounds: any;
  location: any;
  customerIds: string[];
  customers: ICustomer[];
  companies: ICompany[];
  description: string;
  osmbId: string;
  quarterId: string;
  quarter: IQuarter;
  type: string;

  installationRequestIds: string[];
  ticketIds: string[];

  installationRequests: ITicket[];
  tickets: ITicket[];

  suhId: string;

  suh: ICompany;
}

export type BuildingListQueryResponse = {
  buildingList: {
    list: IBuilding[];
    totalCount: number;
  };
  loading: boolean;
  refetch: () => void;
} & QueryResponse;

export type BuildingsByBoundsQueryResponse = {
  buildingsByBounds: IBuilding[];
  loading: boolean;
  refetch: () => void;
} & QueryResponse;

// export type QueryResponse = {
//   cities: ICity[];
//   loading: boolean;
//   refetch: () => void;
// } & QueryResponse;
