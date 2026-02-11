import { z } from 'zod';
import {
  AssociationFilterInput,
  EsTypesMapInput,
  InitialSelectorInput,
  PropertyConditionExtenderInput,
} from './zodSchemas';

type IContext = {
  subdomain: string;
  processId?: string;
};

export type ISegmentDependentModule = {
  name: string;
  types?: string[];
  twoWay?: boolean;
  associated?: boolean;
};

export type ISegmentContentType = {
  moduleName: string;
  type: string;
  description: string;
  esIndex?: string;
  hideInSidebar?: boolean;
  notAssociated?: boolean;
};

export interface SegmentConfigs {
  contentTypes: ISegmentContentType[];
  dependentModules?: ISegmentDependentModule[];

  propertyConditionExtender?: (
    args: z.infer<typeof PropertyConditionExtenderInput>,
    context: IContext,
  ) => Promise<any>;
  associationFilter?: (
    args: z.infer<typeof AssociationFilterInput>,
    context: IContext,
  ) => Promise<any>;
  initialSelector?: (
    args: z.infer<typeof InitialSelectorInput>,
    context: IContext,
  ) => Promise<any>;
  esTypesMap?: (
    args: z.infer<typeof EsTypesMapInput>,
    context: IContext,
  ) => Promise<any>;
}

export enum TSegmentProducers {
  PROPERTY_CONDITION_EXTENDER = 'propertyConditionExtender',
  ASSOCIATION_FILTER = 'associationFilter',
  INITIAL_SELECTOR = 'initialSelector',
  ES_TYPES_MAP = 'esTypesMap',
}
