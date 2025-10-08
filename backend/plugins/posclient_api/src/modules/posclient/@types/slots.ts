import { Document, Schema } from 'mongoose';

export interface IPosSlot {
  _id?: string;
  posId: string;
  posToken: string;
  name: string;
  code: string;
  option: object;
}

export interface IPosSlotDocument extends IPosSlot, Document {
  _id: string;
}
