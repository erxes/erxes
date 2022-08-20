import { QueryResponse } from '@erxes/ui/src/types';

export interface IEvent {
  name: string;
  attributeNames: string[];
}

export interface IConditionFilter {
  segmentKey?: string;
  key?: string;
  name: string;
  operator: string;
  value: string;
}
export interface ISegmentCondition {
  key?: string;
  type: string;

  propertyName?: string;
  propertyOperator?: string;
  propertyValue?: string;
  propertyType?: string;

  eventName?: string;
  eventOccurence?: string;
  eventOccurenceValue?: number;
  eventAttributeFilters?: IConditionFilter[];

  subSegmentId?: string;

  config?: any;
}

export interface ISegmentMap {
  _id?: string;
  key: string;
  contentType: string;
  config?: any;
  conditions: ISegmentCondition[];
  conditionsConjunction: string;
}

export interface ISubSegment {
  contentType: string;
  conditionsConjunction?: string;
  conditions?: ISegmentCondition[];
}

export interface IConditionsForPreview {
  type: string;
  subSegmentForPreview: ISegmentMap;
}
export interface ISegmentWithConditionDoc {
  name: string;
  description: string;
  subOf: string;
  color: string;
  conditions: ISegmentCondition[];
}

export interface ISegmentDoc {
  name: string;
  contentType?: string;
  description: string;
  color: string;
  conditions: ISegmentCondition[];
  subOf: string;
  subSegments?: ISubSegment[];
  conditionsConjunction: string;
  config: any;
  shouldWriteActivityLog: boolean;
}

export interface ISegment extends ISegmentDoc {
  _id: string;
  contentType: string;
  conditionsConjunction: string;
  getSubSegments: ISegment[];
  subSegmentConditions: ISegment[];
  getParentSegment: ISegment;
  config: any;
}

export type SegmentsQueryResponse = {
  segments: ISegment[];
} & QueryResponse;

export type EventsQueryResponse = {
  segmentsEvents: Array<{ name: string; attributeNames: string[] }>;
  loading: boolean;
};

export type HeadSegmentsQueryResponse = {
  segmentsGetHeads: ISegment[];
} & QueryResponse;

export type SegmentDetailQueryResponse = {
  segmentDetail: ISegment;
} & QueryResponse;

// mutation types

export type IField = {
  selectOptions?: Array<{ label: string; value: string | number }>;
  type?: string;
  group?: string;
  value: string;
  label: string;
  options?: string[];
  validation?: string;
  choiceOptions?: string[];
};

export type AddMutationResponse = {
  segmentsAdd: (params: {
    variables: ISegmentWithConditionDoc;
  }) => Promise<any>;
};

export type EditMutationResponse = {
  segmentsEdit: (params: {
    variables: { _id: string; doc: ISegmentWithConditionDoc };
  }) => Promise<any>;
};

export type RemoveMutationResponse = {
  removeMutation: (params: { variables: { _id: string } }) => any;
};

// automations
export type ITrigger = {
  id: string;
  type: string;
  icon?: string;
  label?: string;
  description?: string;
  actionId?: string;
  style?: any;
  config?: any;

  count?: number;
};
