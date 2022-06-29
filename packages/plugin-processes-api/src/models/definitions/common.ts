export interface ICustomField {
  field: string;
  value: any;
  stringValue?: string;
  numberValue?: number;
  dateValue?: Date;
}

export interface ISubUom {
  uomId: string;
  ratio: number;
}
