import { z } from 'zod';
import { techCardFormSchema } from './techCardFormSchema';

export interface ITechCardItem {
  productId: string;
  uom?: string;
  quantity: number;
  costRatio?: number;
}

export interface ITechCard {
  _id: string;
  code?: string;
  name: string;
  description?: string;
  duration?: number;
  durationType?: string;
  inputs: ITechCardItem[];
  outputs: ITechCardItem[];
  status?: string;
}

export type TTechCardForm = z.infer<typeof techCardFormSchema>;
