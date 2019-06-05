export interface ISegmentField {
  _id: string;
}

export interface ISegmentConditionDoc {
  field: string;
  value: string;
  operator: string;
  dateUnit: string;
  type: string;
  brandId?: string;
}
export interface ISegmentCondition extends ISegmentConditionDoc {
  _id: string;
}

export interface ISegmentDoc {
  name: string;
  contentType?: string;
  description: string;
  color: string;
  connector: string;
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
  loading: boolean;
  refetch: () => void;
};

export type HeadSegmentsQueryResponse = {
  segmentsGetHeads: ISegment[];
  loading: boolean;
};

export type SegmentDetailQueryResponse = {
  segmentDetail: ISegment;
  loading: boolean;
  refetch: () => void;
};

// mutation types

export type AddMutationVariables = {
  name: string;
  description: string;
  subOf: string;
  color: string;
  connector: string;
  conditions: ISegmentCondition[];
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
