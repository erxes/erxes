import { Document, Schema } from 'mongoose';

export interface TActivityEntity<TData = any> {
  moduleName: string;
  collectionName: string;
  text?: string;
  data?: TData;
}

export type TActivityLog<
  TTarget = TActivityEntity,
  TContext = TActivityEntity,
  TActor = any,
> = {
  createdAt: Date;
  actorType: string;
  actor: TActor;
  targetType: string;
  target: TTarget;
  contextType: string;
  context: TContext;
  action: {
    type: string;
    description: string;
  };
  changes: any;
  metadata?: any;
};

export type IActivityLogDocument = TActivityLog & {
  _id: string;
} & Document;

const entitySchema = new Schema(
  {
    moduleName: { type: String },
    collectionName: { type: String },
    text: { type: String },
    data: { type: Schema.Types.Mixed },
  },
  { _id: false },
);

const activityActionSchema = new Schema(
  {
    type: { type: String, required: true },
    description: { type: String, required: true },
  },
  { _id: false },
);

export const activityLogsSchema = new Schema({
  createdAt: { type: Date, required: true, default: Date.now },
  activityType: { type: String, required: true },
  actorType: { type: String, required: true },
  actor: { type: Object, required: true },
  targetType: { type: String, required: true },
  target: { type: entitySchema, required: true },
  contextType: { type: String, required: true },
  context: { type: entitySchema, required: true },
  action: {
    type: activityActionSchema,
    required: true,
  },
  changes: { type: Schema.Types.Mixed, required: true },
  metadata: { type: Schema.Types.Mixed },
});
