export interface IElementTranslation {
  _id?: string;
  objectId?: string;
  language: string;
  name?: string;
  note?: string;
  cost?: number;
}

export interface IElement {
  _id: string;
  branchId?: string;
  name?: string;
  content?: string;
  note?: string;
  startTime?: string;
  duration?: number;
  cost?: number;
  categories?: string[];
  quick?: boolean;
  createdAt?: string;
  modifiedAt?: string;
  translations?: IElementTranslation[];
}
