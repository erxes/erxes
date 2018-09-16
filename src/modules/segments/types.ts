export interface ISegmentCondition {
  field: string,
  value: string,
  operator: string,
  dateUnit: string,
  type: string
}

export interface ISegment {
  _id: string;
  name: string;
  description: string;
  color: string;
  connector: string;
  conditions: ISegmentCondition[];
  subOf: any;
  getSubSegments: ISegment[]
}