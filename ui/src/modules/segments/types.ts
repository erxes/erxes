import { QueryResponse } from 'modules/common/types';

export interface IEvent {
  name: string;
  attributeNames: string[];
}

export interface IConditionFilter {
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

  eventName?: string;
  eventOccurence?: string;
  eventOccurenceValue?: number;
  eventAttributeFilters?: IConditionFilter[];
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
}

export interface ISegment extends ISegmentDoc {
  _id: string;
  contentType: string;
  getSubSegments: ISegment[];
  getParentSegment: ISegment;
}

// query types
export type Counts = {
  [key: string]: number;
};

export type SegmentsQueryResponse = {
  segments: ISegment[];
} & QueryResponse;

export type HeadSegmentsQueryResponse = {
  segmentsGetHeads: ISegment[];
} & QueryResponse;

export type EventsQueryResponse = {
  segmentsEvents: Array<{ name: string; attributeNames: string[] }>;
  loading: boolean;
};

export type SegmentDetailQueryResponse = {
  segmentDetail: ISegment;
} & QueryResponse;

// mutation types
export type AddMutationVariables = {
  name: string;
  description: string;
  subOf: string;
  color: string;
  conditions: ISegmentCondition[];
};

export type IField = {
  selectOptions?: Array<{ label: string; value: string | number }>;
  type?: string;
  value: string;
  label: string;
};

export type AddMutationResponse = {
  segmentsAdd: (
    params: {
      variables: AddMutationVariables;
    }
  ) => Promise<any>;
};

export type EditMutationResponse = {
  segmentsEdit: (
    params: { variables: { _id: string; doc: AddMutationVariables } }
  ) => Promise<any>;
};

export type RemoveMutationResponse = {
  removeMutation: (params: { variables: { _id: string } }) => any;
};
