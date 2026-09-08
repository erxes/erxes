import { SegmentRelationMeta } from './relationRegistry';
import { z } from 'zod';
import { SegmentFieldMeta, SegmentFieldNamespace } from './fieldMeta';
import {
  ApplyMembershipInput,
  CountSegmentMembersInput,
  EvaluateFieldsInput,
  ListSegmentMembersInput,
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
  contentType?: string;
  eventTypes?: string[];
  moduleName: string;
  type: string;
  description: string;
  hideInSidebar?: boolean;
  notAssociated?: boolean;
};

export type SegmentEvaluateFieldsResult = {
  values: Record<string, Record<string, unknown>>;
  unavailable?: string[];
};

export type SegmentMemberPage = {
  ids: string[];
  nextCursor?: string;
  unsupported?: string[];
};

export type SegmentMemberCount = {
  count: number;
  unsupported?: string[];
  exceeded?: boolean;
};

export type SegmentApplyMembershipResult = {
  counts: Record<string, number>;
  transitions?: SegmentMembershipTransition[];
  unsupported?: string[];
  countedAt?: string;
};

export type SegmentMembershipTransition = {
  segmentId: string;
  joined: string[];
  left: string[];
};

export interface SegmentConfigs {
  contentTypes: ISegmentContentType[];
  dependentModules?: ISegmentDependentModule[];

  segmentFields?: Record<string, SegmentFieldMeta[]>;
  segmentFieldNamespaces?: Record<string, SegmentFieldNamespace[]>;
  segmentRelations?: SegmentRelationMeta[];

  evaluateFields?: (
    args: z.infer<typeof EvaluateFieldsInput>,
    context: IContext,
  ) => Promise<SegmentEvaluateFieldsResult>;

  listSegmentMembers?: (
    args: z.infer<typeof ListSegmentMembersInput>,
    context: IContext,
  ) => Promise<SegmentMemberPage>;

  countSegmentMembers?: (
    args: z.infer<typeof CountSegmentMembersInput>,
    context: IContext,
  ) => Promise<SegmentMemberCount>;

  applyMembership?: (
    args: z.infer<typeof ApplyMembershipInput>,
    context: IContext,
  ) => Promise<SegmentApplyMembershipResult>;
}

export enum TSegmentProducers {
  EVALUATE_FIELDS = 'evaluateFields',
  LIST_MEMBERS = 'listSegmentMembers',
  COUNT_MEMBERS = 'countSegmentMembers',
  APPLY_MEMBERSHIP = 'applyMembership',
}
