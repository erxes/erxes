export interface ISegmentField {
  _id: string;
}

export interface ISegmentCondition {
  field: string;
  value: string;
  operator: string;
  dateUnit: string;
  type: string;
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