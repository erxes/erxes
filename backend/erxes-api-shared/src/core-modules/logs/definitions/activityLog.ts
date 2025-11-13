import { Schema } from 'mongoose';

export type TActivityLog<TTarget = any, TContext = any> = {
  createdAt: Date;
  actorType: string;
  actor: any;
  targetType: string;
  target: TTarget;
  contentType: string;
  context: TContext;
  action: {
    action: string;
    description: string;
  };
  changes: any;
  metadata: any;
  pluginName: string;
};

export type IActivityLogDocument = TActivityLog & {
  _id: string;
};

export const activityLogSchema = new Schema({
  createdAt: { type: Date, required: true, default: new Date() },
  actorType: { type: String, required: true },
  actor: { type: Object, required: true },
  targetType: { type: String, required: true },
  target: { type: Object, required: true },
  contentType: { type: String, required: true },
  context: { type: Object, required: true },
  action: {
    type: new Schema({
      action: { type: String, required: true },
      description: { type: String, required: true },
    }),
    required: true,
  },
  changes: { type: Schema.Types.Mixed, required: true },
  metadata: { type: Schema.Types.Mixed, required: true },
  pluginName: { type: String, required: true },
});
