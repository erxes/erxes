type IContext = {
  subdomain: string;
  processId?: string;
};

type ISegmentDependentServices = {
  name: string;
  types?: string[];
  twoWay?: boolean;
  associated?: boolean;
};

type SegmentContentType = {
  type: string;
  description: string;
  esIndex?: string;
  hideInSidebar?: boolean;
  notAssociated?: boolean;
};

export interface SegmentConfigs {
  contentTypes: SegmentContentType[];
  dependentServices?: ISegmentDependentServices[];

  propertyConditionExtender?: (context: IContext, data: any) => Promise<any>;
  associationFilter?: (context: IContext, data: any) => Promise<any>;
  initialSelector?: (context: IContext, data: any) => Promise<any>;
  esTypesMap?: (context: IContext, data: any) => Promise<any>;
}

export interface ISegmentContentType {
  type: string;
  description: string;
  esIndex: string;
  notAssociated?: boolean;
  hideInSidebar?: boolean;
}

export interface IDependentService {
  name: string;
  twoWay?: boolean;
  associated?: boolean;
}

export enum TSegmentProducers {
  PROPERTY_CONDITION_EXTENDER = 'propertyConditionExtender',
  ASSOCIATION_FILTER = 'associationFilter',
  INITIAL_SELECTOR = 'initialSelector',
  ES_TYPES_MAP = 'esTypesMap',
}
