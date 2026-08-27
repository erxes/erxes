import { z } from 'zod';
import {
  SegmentFieldMeta,
  SegmentFieldNamespace,
  SegmentRelationMeta,
} from './fieldMeta';
import {
  ApplyMembershipInput,
  AssociationFilterInput,
  CountSegmentMembersInput,
  EsTypesMapInput,
  EvaluateFieldsInput,
  InitialSelectorInput,
  ListSegmentMembersInput,
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
  /**
   * The key a segment stores and `segmentFields` is declared under, in the
   * `plugin:module.record` form the event dispatcher also uses - e.g.
   * `core:contacts.customers`. The record part names the type, not a
   * collection: `core:contacts.leads` is a real type that lives among
   * customers.
   */
  contentType?: string;
  /**
   * Only for a type whose events arrive under another name. A segment type is
   * normally the same string the event dispatcher emits, so this is left unset;
   * it exists for the case where two types share a collection - leads live
   * among customers, so nothing ever emits an event named after them.
   */
  eventTypes?: string[];
  moduleName: string;
  type: string;
  description: string;
  esIndex?: string;
  hideInSidebar?: boolean;
  notAssociated?: boolean;
};

/**
 * Values a plugin resolved for one batch. Absent subjects and absent refs mean
 * "no value", which is a definite answer; a ref the plugin could not answer at
 * all belongs in `unavailable` so membership stays untouched instead of being
 * decided against a missing value.
 */
export type SegmentEvaluateFieldsResult = {
  values: Record<string, Record<string, unknown>>;
  unavailable?: string[];
};

/**
 * One page of a segment's members. `unsupported` lists the parts of the tree
 * the filter could not express, so a caller knows the page is narrower than
 * the definition rather than trusting an incomplete list.
 */
export type SegmentMemberPage = {
  ids: string[];
  nextCursor?: string;
  unsupported?: string[];
};

export type SegmentMemberCount = {
  count: number;
  unsupported?: string[];
};

/**
 * What a plugin's records now say about their membership.
 *
 * The count is read back from the collection rather than derived from the
 * delta: an incremented number drifts the moment one apply is lost or replayed,
 * and the membership index makes an exact count cheap.
 */
export type SegmentApplyMembershipResult = {
  /** Segment id -> how many of this plugin's records are now members. */
  counts: Record<string, number>;
  /**
   * Who actually changed side. Only records that moved appear, so the history
   * this feeds records movement rather than every time a segment was evaluated.
   */
  transitions?: SegmentMembershipTransition[];
  /** Content types this plugin does not own, so nothing was written for them. */
  unsupported?: string[];
};

export type SegmentMembershipTransition = {
  segmentId: string;
  joined: string[];
  left: string[];
};

export interface SegmentConfigs {
  contentTypes: ISegmentContentType[];
  dependentModules?: ISegmentDependentModule[];

  /**
   * Filterable fields per content type, plus the traversals this plugin owns.
   * Plain data, so service discovery carries it to core without a round trip;
   * the resolver behind a derived field is reached through `evaluateFields`.
   */
  segmentFields?: Record<string, SegmentFieldMeta[]>;
  /** Tenant-keyed namespaces per content type, e.g. `customFieldsData`. */
  segmentFieldNamespaces?: Record<string, SegmentFieldNamespace[]>;
  segmentRelations?: SegmentRelationMeta[];

  /**
   * Resolves one batch of subjects against the refs a plan assigned to this
   * plugin. Always answer the whole batch in as few queries as the request
   * list allows - never one query per subject.
   */
  evaluateFields?: (
    args: z.infer<typeof EvaluateFieldsInput>,
    context: IContext,
  ) => Promise<SegmentEvaluateFieldsResult>;

  /**
   * Runs a segment against this plugin's own collection. The plugin compiles
   * the tree with its own field declarations, so the query never crosses a
   * service boundary.
   */
  listSegmentMembers?: (
    args: z.infer<typeof ListSegmentMembersInput>,
    context: IContext,
  ) => Promise<SegmentMemberPage>;

  countSegmentMembers?: (
    args: z.infer<typeof CountSegmentMembersInput>,
    context: IContext,
  ) => Promise<SegmentMemberCount>;

  /**
   * Writes settled membership onto this plugin's own records. Only the plugin
   * that owns the collection may touch it, so the segmentation worker never
   * writes into another service's data.
   */
  applyMembership?: (
    args: z.infer<typeof ApplyMembershipInput>,
    context: IContext,
  ) => Promise<SegmentApplyMembershipResult>;

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
  EVALUATE_FIELDS = 'evaluateFields',
  LIST_MEMBERS = 'listSegmentMembers',
  COUNT_MEMBERS = 'countSegmentMembers',
  APPLY_MEMBERSHIP = 'applyMembership',
}
