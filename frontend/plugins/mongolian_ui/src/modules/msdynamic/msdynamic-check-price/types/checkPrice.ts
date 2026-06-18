export type PriceStatus = 'UPDATE' | 'MATCH' | 'CREATE' | 'DELETE' | 'ERROR';

export interface IPriceItem {
  _id?: string;
  Item_No?: string;
  Unit_Price?: number;
  Ending_Date?: string;
  code?: string;
  unitPrice?: number;
  status: PriceStatus;
  isSynced?: boolean;
  syncStatus?: boolean;
}

export interface ICheckPriceResponse {
  update?: { items: IPriceItem[] };
  match?: { items: IPriceItem[] };
  create?: { items: IPriceItem[] };
  delete?: { items: IPriceItem[] };
  error?: { items: IPriceItem[] };
}

export const PRICE_STATUS_LABELS: Record<PriceStatus, string> = {
  UPDATE: 'Update product price',
  MATCH: 'Matched product price',
  CREATE: 'Not created product',
  DELETE: 'Unmatched product',
  ERROR: 'Error product',
};
