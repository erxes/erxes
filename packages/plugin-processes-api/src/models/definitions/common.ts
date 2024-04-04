export interface ICustomField {
  field: string;
  value: any;
  stringValue?: string;
  numberValue?: number;
  dateValue?: Date;
}

export interface ISubUom {
  uom: string;
  ratio: number;
}
