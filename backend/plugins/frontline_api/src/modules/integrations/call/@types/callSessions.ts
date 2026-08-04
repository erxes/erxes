import { Document } from 'mongoose';

export type CallSessionStatus =
  | 'ringing'
  | 'active'
  | 'ended'
  | 'missed'
  | 'failed';

export interface ICallSessionOperator {
  userId?: string;
  extensionNumber: string;
  state: 'ringing' | 'answered' | 'rejected' | 'noanswer';
  ringedAt?: Date;
  answeredAt?: Date;
}

export interface ICallSession {
  uniqueid: string;
  linkedid?: string;
  inboxIntegrationId: string;
  conversationId?: string;
  customerId?: string;
  customerPhone: string;
  operatorPhone?: string;
  callType: 'incoming' | 'outgoing';
  status: CallSessionStatus;
  queueName?: string;
  ringingOperators: ICallSessionOperator[];
  answeredBy?: string;
  answeredExtension?: string;
  startedAt: Date;
  answeredAt?: Date;
  endedAt?: Date;
  durationSec?: number;
  hangupCause?: string;
  source: 'cti' | 'cdr' | 'sip';
  cdrAcctId?: string;
  recordUrl?: string;
  diversion?: string;
  raw?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICallSessionDocument extends ICallSession, Document {
  _id: string;
}
