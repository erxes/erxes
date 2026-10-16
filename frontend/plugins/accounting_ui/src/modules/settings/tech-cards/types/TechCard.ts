import { z } from 'zod';
import { techCardFormSchema } from './techCardFormSchema';

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
  _id: string;
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

export type TTechCardForm = z.infer<typeof techCardFormSchema>;

export interface ITechCardOutputRow {
  _id: string;
  techCard: ITechCard;
  output: ITechCardItem;
  outputIndex: number;
}
