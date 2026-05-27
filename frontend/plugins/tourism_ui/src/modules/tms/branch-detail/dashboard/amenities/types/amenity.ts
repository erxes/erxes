export interface IAmenityTranslation {
  _id?: string;
  language: string;
  name?: string;
}

export interface IAmenity {
  _id: string;
  branchId?: string;
  name?: string;
  icon?: string;
  quick?: boolean;
  language?: string;
  translations?: IAmenityTranslation[];
  createdAt?: string;
  modifiedAt?: string;
}
