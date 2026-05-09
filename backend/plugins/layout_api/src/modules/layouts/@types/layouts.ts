import { Document } from 'mongoose';

export type LayoutKind = 'page' | 'dashboard';

export interface ILayouts {
  name: string;
  slug: string;
  type: LayoutKind;
  config: Record<string, unknown>;
  isPublished?: boolean;
}

export interface ILayoutsDocument extends ILayouts, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
