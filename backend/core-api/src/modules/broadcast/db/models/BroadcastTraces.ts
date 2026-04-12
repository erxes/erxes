import { broadcastTraceSchema } from '@/broadcast/db/definitions/broadcastTraces';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

export type TraceType = 'regular' | 'success' | 'failure';

export interface IBroadcastTrace {
  engageMessageId: string;
  message: string;
  type: TraceType;
}

export interface IBroadcastTraceDocument extends IBroadcastTrace, Document {}

export interface IBroadcastTraceModel extends Model<IBroadcastTraceDocument> {
  createTrace(
    engageMessageId: string,
    type: TraceType,
    message: string,
  ): Promise<IBroadcastTraceDocument>;
}

export const loadBroadcastTraceClass = (models: IModels) => {
  class BroadcastTrace {
    public static async createTrace(
      engageMessageId: string,
      type: TraceType,
      message: string,
    ) {
      return models.BroadcastTraces.create({ engageMessageId, type, message });
    }
  }

  broadcastTraceSchema.loadClass(BroadcastTrace);

  return broadcastTraceSchema;
};
