import { Schema } from 'mongoose';

/** Turns taken by one "Pick a team member" step: `_id` is automationId:actionId. */
export interface IPickTurnDocument {
  _id: string;
  turn: number;
  updatedAt?: Date;
}

export const pickTurnSchema = new Schema<IPickTurnDocument>(
  {
    _id: { type: String },
    turn: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: false, updatedAt: true } },
);
