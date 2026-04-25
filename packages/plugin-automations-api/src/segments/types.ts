export type TSegmentCondition = {
  type: "property" | "event" | "subSegment";
  propertyType?: string;
  propertyName?: string;
  propertyOperator?: string;
  propertyValue?: string;
  subSegmentId?: string;
  subSegmentForPreview?: TSegment;
};

export type TSegment = {
  _id?: string;
  contentType: string;
  subOf?: string;
  conditions?: TSegmentCondition[];
  conditionsConjunction?: "and" | "or";
};

export type TSegmentLoader = (segmentId: string) => Promise<TSegment | null>;

export type TSegmentCompileResult =
  | { ok: true; selector: Record<string, any> }
  | { ok: false; reason: string };
