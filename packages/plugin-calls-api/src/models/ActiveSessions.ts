import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import {
  activeSessionSchema,
  IActiveSessionDocument
} from './definitions/activeSessions';

export interface IActiveSessionModel extends Model<IActiveSessionDocument> {
  getActiveSession(userId: string): Promise<IActiveSessionDocument>;
}

export const loadActiveSessionClass = (models: IModels) => {
  class ActiveSession {
    public static async getActiveSession(userId: string) {
      const activeSession = await models.ActiveSessions.findOne({
        userId
      }).lean();

      if (!activeSession) {
        return;
      }

      return activeSession;
    }
  }

  activeSessionSchema.loadClass(ActiveSession);

  return activeSessionSchema;
};
