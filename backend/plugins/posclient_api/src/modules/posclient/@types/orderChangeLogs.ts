import { Document } from 'mongoose';

export interface IOrderChangeEntry {
  field: string;
  oldValue?: unknown;
  newValue?: unknown;
}

export interface IOrderChangeLog {
  orderId?: string;
  cartId?: string;
  eventId?: string;
  source?: string;
  occurredAt?: Date;
  posToken: string;
  userId?: string;
  createdAt?: Date;
  changes: IOrderChangeEntry[];
}

export interface ICartLogItem {
  _id: string;
  productId: string;
  productName?: string;
  count: number;
  unitPrice: number;
  discountAmount?: number;
  discountPercent?: number;
  discountInfos?: {
    type: string;
    title?: string;
    amount?: number;
    percent?: number;
  }[];
  isTake?: boolean;
  isPackage?: boolean;
  manufacturedDate?: string;
  attachment?: { url?: string } | null;
  productImgUrl?: string;
  categoryId?: string;
  status?: string;
  description?: string;
}

export interface ICartChangeLogInput {
  eventId: string;
  cartId: string;
  orderId?: string;
  actorId: string;
  occurredAt: Date;
  beforeItems: ICartLogItem[];
  afterItems: ICartLogItem[];
}

export interface IOrderChangeLogDocument extends Document, IOrderChangeLog {
  _id: string;
}
