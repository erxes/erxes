import {
  IActivityLog,
  IActivityLogForMonth
} from '@erxes/ui-log/src/activityLogs/types';
import {
  IProduct as IProductC,
  IProductCategory as IProductCategoryC,
  IProductDoc as IProductDocC
} from '@erxes/ui-products/src/types';

import { ICustomer } from '@erxes/ui-contacts/src/customers/types';
import { IDeal } from '@erxes/ui-cards/src/deals/types';
import { ILocationOption } from '@erxes/ui/src/types';
import { IUser } from '@erxes/ui/src/auth/types';

export interface IRouterProps {
  history: any;
  location: any;
  match: any;
}

export type IProductDoc = IProductDocC & {};

export type IProduct = IProductC & {};

export type IProductCategory = IProductCategoryC & {};

export interface ICarCategoryDoc {
  _id?: string;
  name: string;
  description?: string;
  parentId?: string;
  collapseContent?: string[];
}

export type ProductCategoriesQueryResponse = {
  productCategories: IProductCategory[];
} & QueryResponse;

export interface ITrailer {
  _id: string;
  manufacture?: string;
  trailerType?: string;
  tireLoadType?: string;
  bowType?: string;
  brakeType?: string;
  floorType?: string;
  liftType?: string;
  wagonCapacity?: string[];
  liftWagonCapacity?: string[];

  generalClassification?: string;

  nowYear?: number;
  attachments?: any;
  wagonLength?: number;
  wagonWeight?: number;
  weight?: number;
  plateNumber?: string;
  vinNumber?: string;
  moreValues?: any;

  liftHeight?: number;
  vintageYear?: number;
  wagonWidth?: number;
  porchekHeight?: number;
  volume?: number;
  capacityL?: number;
  barrel1?: number;
  barrel2?: number;
  barrel3?: number;
  barrel4?: number;
  barrel5?: number;
  barrel6?: number;
  barrel7?: number;
  barrel8?: number;
  importYear?: number;

  meterWarranty?: Date;
  diagnosisDate?: Date;
  taxDate?: Date;

  carModel?: string;
  mark?: string;
  color?: string;
  totalAxis?: string;
  steeringAxis?: string;
  barrelNumber?: string;
  pumpCapacity?: string;
  wagonCapacityValue?: string;
  liftWagonCapacityValue?: string;
}

export type IOption = {
  label: string;
  value: string;
  avatar?: string;
};

export interface ICarDoc {
  createdAt?: Date;
  modifiedAt?: Date;

  scopeBrandIds?: string[];
  mergedIds?: string[];
  status?: string;
  description?: string;

  plateNumber?: string;
  vinNumber?: string;
  color: string;
  categoryId?: string;

  fuelType?: string;
  steeringWheel?: string;
  manufacture?: string;
  drivingClassification: string;
  repairService: string;
  engineChange?: string;
  listChange?: string;
  trailerType: string;
  tireLoadType: string;
  bowType: string;
  brakeType?: string;
  liftType?: string;

  generalClassification?: string;

  vintageYear?: number;
  importYear?: number;

  carModel?: string;
  type?: string;
  mark?: string;
  totalAxis?: string;
  steeringAxis?: string;
  forceAxis?: string;
  ownerBy?: string;
  transmission?: string;
  seats: string;
  doors: string;
  barrelNumber?: string;
  pumpCapacity?: string;
  floorType?: string;
  interval?: string[];
  intervalValue?: string;
  running?: string;
  runningValue?: number;
  wagonCapacity?: string[];
  liftWagonCapacity?: string[];
  wagonCapacityValue?: string;
  liftWagonCapacityValue?: string;

  attachments?: any;
  frontAttachments?: any;
  leftAttachments?: any;
  rightAttachments?: any;
  backAttachments?: any;
  floorAttachments?: any;
  transformationAttachments?: any;
  meterWarranty?: Date;
  diagnosisDate?: Date;
  taxDate?: Date;

  weight?: number;
  engineCapacity?: string;
  capacityL?: number;
  barrel1?: number;
  barrel2?: number;
  barrel3?: number;
  barrel4?: number;
  barrel5?: number;
  barrel6?: number;
  barrel7?: number;
  barrel8?: number;
  forceCapacityValue?: number;
  forceValue?: number;

  wagonLength?: number;
  wagonWidth?: number;
  height?: number;

  porchekHeight?: number;
  volume?: number;
  liftHeight?: number;
}

export interface ICarCategory {
  _id: string;
  name: string;
  order: string;
  code: string;
  description?: string;
  parentId?: string;
  collapseContent?: string[];
  createdAt: Date;
  carCount: number;
  isRoot: boolean;
}

export type CarCategoriesQueryResponse = {
  carCategories: ICarCategory[];
  loading: boolean;
  refetch: () => void;
};

export type CarCategoriesCountQueryResponse = {
  carCategoriesTotalCount: number;
  loading: boolean;
  refetch: () => void;
};

export type CarCategoryRemoveMutationResponse = {
  carCategoryRemove: (mutation: { variables: { _id: string } }) => Promise<any>;
};

export type CategoryDetailQueryResponse = {
  carCategoryDetail: ICarCategory;
  productCategoryDetail: IProductCategory;
  loading: boolean;
};

export interface IActivityLogYearMonthDoc {
  year: number;
  month: number;
}

export interface ICarActivityLog {
  date: IActivityLogYearMonthDoc;
  list: IActivityLog[];
}

export interface ICar extends ICarDoc {
  _id: string;
  owner: IUser;
  category?: ICarCategory;
}

// mutation types

export type ProductRemoveMutationResponse = {
  productsRemove: (mutation: {
    variables: { productIds: string[] };
  }) => Promise<any>;
};

export type EditMutationResponse = {
  carsEdit: (params: { variables: ICar }) => Promise<any>;
};

export type RemoveMutationVariables = {
  carIds: string[];
};

export type RemoveMutationResponse = {
  carsRemove: (params: { variables: RemoveMutationVariables }) => Promise<any>;
};

// ------------------
export type CarCategoryMatchMutationVariables = {
  carCategoryId: string;
  productCategoryIds: string[];
};

export type CarCategoryMatchMutationResponse = {
  editMatch: (params: {
    variables: CarCategoryMatchMutationVariables;
  }) => Promise<any>;
};

export type ProductMatchMutationVariables = {
  carCategoryIds: string[];
  productCategoryId: string;
};

export type ProductMatchMutationResponse = {
  editMatch: (params: {
    variables: ProductMatchMutationVariables;
  }) => Promise<any>;
};
// ------------------

export type MergeMutationVariables = {
  carIds: string[];
  carFields: any;
};

export type MergeMutationResponse = {
  carsMerge: (params: { variables: MergeMutationVariables }) => Promise<any>;
};

export type AddMutationResponse = {
  carsAdd: (params: { variables: ICarDoc }) => Promise<any>;
};

// ------------------
export type CarCategoryMatchQueryResponse = {
  carCategoryMatchProducts: {
    productCategories: IProductCategory[];
    productCategoryIds: string[];
    carCategoryId: string[];
  };
  loading: boolean;
  refetch: () => void;
};

export type ProductMatchQueryResponse = {
  productMatchCarCategories: {
    carCategories: ICarCategory[];
    carCategoryIds: string[];
    productCategoryId: string[];
  };
  loading: boolean;
  refetch: () => void;
};

// query types

export type ProductCategoryRemoveMutationResponse = {
  productCategoryRemove: (mutation: {
    variables: { _id: string };
  }) => Promise<any>;
};

export type ProductCategoriesCountQueryResponse = {
  productCategoriesTotalCount: number;
} & QueryResponse;
// ------------------

export type QueryResponse = {
  loading: boolean;
  refetch: () => Promise<any>;
  error?: string;
};

export type ProductsQueryResponse = {
  products: IProduct[];
} & QueryResponse;

export type ProductsCountQueryResponse = {
  productsTotalCount: number;
} & QueryResponse;

export type ListQueryVariables = {
  page?: number;
  perPage?: number;
  segment?: string;
  searchValue?: string;

  categoryId?: string;
  ids?: string[];
  sortField?: string;
  sortDirection?: number;
};

type ListConfig = {
  name: string;
  label: string;
  order: number;
};

export type MainQueryResponse = {
  carsMain: { list: ICar[]; totalCount: number };
  loading: boolean;
  refetch: () => void;
};

export type CarsQueryResponse = {
  cars: ICar[];
  loading: boolean;
  refetch: () => void;
};

export type ListConfigQueryResponse = {
  fieldsDefaultColumnsConfig: ListConfig[];
  loading: boolean;
};

export type DetailQueryResponse = {
  carDetail: ICar;
  productDetail: IProduct;
  loading: boolean;
};

export type ActivityLogQueryResponse = {
  activityLogs: IActivityLogForMonth[];
  loading: boolean;
};

type Count = {
  [key: string]: number;
};

type CarCounts = {
  bySegment: Count;
  byTag: Count;
  byBrand: Count;
  byLeadStatus: Count;
  byCategory: Count;
};

export type CountQueryResponse = {
  carCounts: CarCounts;
  loading: boolean;
  refetch: () => void;
};

export interface IParticipant {
  _id: string;
  tripId: string;
  driver: ICustomer;
  route: IRoute;
  cars: ICar[];
  deal: IDeal;
  detail?: {
    price: number;
  };
  status: string;
}

export type ParticipantsQueryResponse = {
  participants: IParticipant[];
  loading: boolean;
  refetch: () => void;
};

export type RemoveParticipantsMutation = ({
  variables: { dealId, customerIds }
}) => Promise<any>;

export type IPlace = {
  _id: string;
  province: string;
  name: string;
  code: string;
  center: ILocationOption;
};

export type IDirection = {
  _id: string;
  placeIds: [string, string];
  places: [IPlace, IPlace];
  totalDistance: number;
  roadConditions: string[];
  roadCode: string;
  routeCode: string;
  duration: number;
  googleMapPath?: string;
};

export type IDirectionItem = {
  directionId: string;
  order: number;
};

export type IRouteSummary = {
  placeNames: string;
  totalDistance: number;
  totalDuration: number;
};

export type IRoute = {
  _id: string;
  name: string;
  code: string;
  directionIds: string[];
  directions: IDirection[];
  summary: IRouteSummary;
};

export type IDealPlace = {
  dealId: string;
  startPlaceId: string;
  endPlaceId: string;
  startPlace: IPlace;
  endPlace: IPlace;
};

export type ITrackingData = {
  lat: number;
  lng: number;
  trackedDate: Date;
};

export type ITrip = {
  _id: string;
  carIds: string[];
  closedDate: Date;
  createdAt: Date;
  dealIds: string[];
  driverId: string;
  estimatedCloseDate: Date;
  routeId: string;
  routeReversed: boolean;
  startedDate: Date;
  status: string;
  statusInfo: any;
  route: IRoute;
  driver: ICustomer;
  deals: IDeal[];
  cars: ICar[];
  trackingData: ITrackingData[];
};
