import { FilterQuery, Model } from 'mongoose';
import { callSessionSchema } from '../definitions/callSessions';
import {
  ICallSession,
  ICallSessionDocument,
} from '@/integrations/call/@types/callSessions';
import { IModels } from '~/connectionResolvers';

export const SIBLING_SESSION_WINDOW_MS = 60_000;

export interface IFindSiblingParams {
  inboxIntegrationId: string;
  customerPhone: string;
  excludeUniqueid?: string;
  windowMs?: number;
}

export interface ICallSessionModel extends Model<ICallSessionDocument> {
  findByUniqueId(uniqueid: string): Promise<ICallSessionDocument | null>;
  findSibling(params: IFindSiblingParams): Promise<ICallSessionDocument | null>;
  upsertSession(
    doc: Partial<ICallSession> & { uniqueid: string },
  ): Promise<ICallSessionDocument>;
  markAnswered(
    uniqueid: string,
    extensionNumber: string,
    userId?: string,
  ): Promise<ICallSessionDocument | null>;
  markEnded(
    uniqueid: string,
    payload: {
      endedAt?: Date;
      hangupCause?: string;
      durationSec?: number;
      recordUrl?: string;
      cdrAcctId?: string;
      disposition?: string;
    },
  ): Promise<ICallSessionDocument | null>;
  attachOperator(
    uniqueid: string,
    operator: {
      userId?: string;
      extensionNumber: string;
      state?: 'ringing' | 'answered' | 'rejected' | 'noanswer';
    },
  ): Promise<ICallSessionDocument | null>;
}

export const loadCallSessionClass = (models: IModels) => {
  class CallSession {
    public static async findByUniqueId(uniqueid: string) {
      if (!uniqueid) return null;
      return models.CallSessions.findOne({ uniqueid });
    }

    public static async findSibling({
      inboxIntegrationId,
      customerPhone,
      excludeUniqueid,
      windowMs = SIBLING_SESSION_WINDOW_MS,
    }: IFindSiblingParams) {
      if (!inboxIntegrationId || !customerPhone) return null;

      const selector: FilterQuery<ICallSessionDocument> = {
        inboxIntegrationId,
        customerPhone,
        conversationId: { $exists: true, $nin: ['', null] },
        updatedAt: { $gte: new Date(Date.now() - windowMs) },
      };

      if (excludeUniqueid) {
        selector.uniqueid = { $ne: excludeUniqueid };
      }

      return models.CallSessions.findOne(selector).sort({ updatedAt: -1 });
    }

    public static async upsertSession(
      doc: Partial<ICallSession> & { uniqueid: string },
    ) {
      const { uniqueid, ...rest } = doc;
      const now = new Date();

      const result = await models.CallSessions.findOneAndUpdate(
        { uniqueid },
        {
          $setOnInsert: {
            uniqueid,
            startedAt: rest.startedAt || now,
            status: rest.status || 'ringing',
            source: rest.source || 'cti',
            ringingOperators: rest.ringingOperators || [],
          },
          $set: Object.fromEntries(
            Object.entries(rest).filter(
              ([k]) =>
                !['startedAt', 'status', 'source', 'ringingOperators'].includes(
                  k,
                ),
            ),
          ),
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );

      return result as ICallSessionDocument;
    }

    public static async attachOperator(
      uniqueid: string,
      operator: {
        userId?: string;
        extensionNumber: string;
        state?: 'ringing' | 'answered' | 'rejected' | 'noanswer';
      },
    ) {
      const session = await models.CallSessions.findOne({ uniqueid });
      if (!session) return null;

      const existing = session.ringingOperators.find(
        (op) => op.extensionNumber === operator.extensionNumber,
      );

      if (existing) {
        existing.state = operator.state || existing.state;
        if (operator.userId) existing.userId = operator.userId;
        if (operator.state === 'ringing') existing.ringedAt = new Date();
        if (operator.state === 'answered') existing.answeredAt = new Date();
      } else {
        session.ringingOperators.push({
          userId: operator.userId,
          extensionNumber: operator.extensionNumber,
          state: operator.state || 'ringing',
          ringedAt: new Date(),
        });
      }

      await session.save();
      return session;
    }

    public static async markAnswered(
      uniqueid: string,
      extensionNumber: string,
      userId?: string,
    ) {
      const session = await models.CallSessions.findOne({ uniqueid });
      if (!session) return null;

      if (session.status === 'ended') return session;

      session.status = 'active';
      session.answeredAt = session.answeredAt || new Date();
      session.answeredExtension = extensionNumber;
      if (userId) session.answeredBy = userId;

      const op = session.ringingOperators.find(
        (o) => o.extensionNumber === extensionNumber,
      );
      if (op) {
        op.state = 'answered';
        op.answeredAt = new Date();
        if (userId) op.userId = userId;
      } else {
        session.ringingOperators.push({
          userId,
          extensionNumber,
          state: 'answered',
          answeredAt: new Date(),
        });
      }

      session.ringingOperators = session.ringingOperators.map((o) =>
        o.extensionNumber !== extensionNumber && o.state === 'ringing'
          ? { ...o, state: 'noanswer' }
          : o,
      ) as any;

      await session.save();
      return session;
    }

    public static async markEnded(
      uniqueid: string,
      payload: {
        endedAt?: Date;
        hangupCause?: string;
        durationSec?: number;
        recordUrl?: string;
        cdrAcctId?: string;
        disposition?: string;
      },
    ) {
      const session = await models.CallSessions.findOne({ uniqueid });
      if (!session) return null;

      const wasAnswered =
        !!session.answeredAt ||
        session.status === 'ended' ||
        session.status === 'active' ||
        ((payload.disposition || '').toUpperCase() === 'ANSWERED' &&
          (payload.durationSec || 0) > 0);
      session.status = wasAnswered ? 'ended' : 'missed';
      session.endedAt = payload.endedAt || new Date();
      const ranks: Record<string, number> = {
        ANSWERED: 4,
        'NO ANSWER': 3,
        BUSY: 2,
        FAILED: 1,
      };
      const dispositionRank = (d?: string) =>
        ranks[(d || '').toUpperCase()] ?? 0;
      if (
        payload.hangupCause &&
        (!session.hangupCause ||
          dispositionRank(payload.hangupCause) >=
            dispositionRank(session.hangupCause))
      ) {
        session.hangupCause = payload.hangupCause;
      }
      if (payload.durationSec !== undefined)
        session.durationSec = payload.durationSec;
      if (payload.recordUrl) session.recordUrl = payload.recordUrl;
      if (payload.cdrAcctId) session.cdrAcctId = payload.cdrAcctId;

      await session.save();
      return session;
    }
  }

  callSessionSchema.loadClass(CallSession);
  return callSessionSchema;
};
