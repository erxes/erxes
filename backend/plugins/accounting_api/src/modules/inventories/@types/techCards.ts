import { Document } from 'mongoose';

export interface ITechCardItem {
  productId: string;
  uom?: string;
  quantity: number;
  costRatio?: number;
}

export interface ITechCardCost {
  name: string;
  amount: number;
  accountId: string;
}

export interface ITechCard {
  code?: string;
  name: string;
  description?: string;
  duration?: number;
  durationType?: string;
  laborCosts?: ITechCardCost[];
  overheadCosts?: ITechCardCost[];
  inputs: ITechCardItem[];
  outputs: ITechCardItem[];
  status?: string;
}

export interface ITechCardDocument extends ITechCard, Document {
  _id: string;
  createdAt: Date;
  createdBy: string;
  modifiedAt: Date;
  modifiedBy: string;
}

export interface ITechCardListParams {
  searchValue?: string;
  status?: string;
  laborCostName?: string;
  overheadCostName?: string;
  hasLabor?: boolean;
  hasOverhead?: boolean;
  inputProductId?: string;
  outputProductId?: string;
  durationType?: string;
  page?: number;
  perPage?: number;
  sortField?: string;
  sortDirection?: number;
}

export interface ITechCardOutputRow {
  _id: string;
  techCard: ITechCardDocument;
  output: ITechCardItem;
  outputIndex: number;
}

export interface ITechCardOutputListParams extends ITechCardListParams {
  duplicatedOutput?: boolean;
}
