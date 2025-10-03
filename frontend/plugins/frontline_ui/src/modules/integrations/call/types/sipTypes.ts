import { ICallConfigDoc } from '@/integrations/call/types/callTypes';

export enum SipStatusEnum {
  DISCONNECTED = 'sipStatus/DISCONNECTED',
  CONNECTING = 'sipStatus/CONNECTING',
  CONNECTED = 'sipStatus/CONNECTED',
  REGISTERED = 'sipStatus/REGISTERED',
  ERROR = 'sipStatus/ERROR',
}

export enum SipErrorTypeEnum {
  CONFIGURATION = 'sipErrorType/CONFIGURATION',
  CONNECTION = 'sipErrorType/CONNECTION',
  REGISTRATION = 'sipErrorType/REGISTRATION',
}

export enum CallStatusEnum {
  IDLE = 'callStatus/IDLE',
  STARTING = 'callStatus/STARTING',
  ACTIVE = 'callStatus/ACTIVE',
  STOPPING = 'callStatus/STOPPING',
  FAILED = 'callStatus/FAILED',
  ENDED = 'callStatus/ENDED',
  DISCONNECTED = 'callStatus/DISCONNECTED',
}

export enum CallDirectionEnum {
  INCOMING = 'callDirection/INCOMING',
  OUTGOING = 'callDirection/OUTGOING',
}

export interface ExtraHeaders {
  register?: string[];
  invite?: string[];
}

// https://developer.mozilla.org/en-US/docs/Web/API/RTCIceServer
export type IceServers = {
  urls: string | string[];
  username?: string;
  credential?: string;
  credentialType?: string;
  password?: string;
}[];

export interface Sip {
  status?: SipStatusEnum;
  errorType?: SipErrorTypeEnum;
  errorMessage?: string;
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  autoRegister?: boolean;
  autoAnswer: boolean;
  sessionTimersExpires: number;
  extraHeaders: ExtraHeaders;
  iceServers: IceServers;
  debug: boolean;
}

export interface Call {
  id: string;
  status: CallStatusEnum;
  direction: CallDirectionEnum;
  counterpart: string;
  startTime: string;
  endTime: string;
}

export interface SipProviderProps {
  host: string | null;
  port: number | null;
  pathname?: string;
  user: string | null;
  password?: string;
  autoRegister?: boolean;
  autoAnswer?: boolean;
  iceRestart?: boolean;
  historyId?: string | null;
  sessionTimersExpires?: number;
  extraHeaders?: ExtraHeaders;
  iceServers?: IceServers;
  debug?: boolean;
  createSession: () => void;

  addHistory: (
    callStatus: string,
    timeStamp: number,
    direction: string,
    customerPhone: string,
    callStartTime: Date,
    queueName: string | null,
  ) => void;
  updateHistory: (
    timeStamp: number,
    callStartTime: Date,
    callEndTime: Date,
    callStatus: string,
    direction: string,
    customerPhone: string,
    diversionHeader?: string,
    endedBy?: string,
    historyId?: string,
  ) => void;
}
export interface SipContextValue {
  sip: {
    createSession: () => void;

    addHistory: (
      callStatus: string,
      timeStamp: number,
      direction: string,
      customerPhone: string,
      callStartTime: Date,
      queueName: string | null,
    ) => void;
    updateHistory: (
      timeStamp: number,
      callStartTime: Date,
      callEndTime: Date,
      callStatus: string,
      direction: string,
      customerPhone: string,
      diversionHeader?: string,
      endedBy?: string,
    ) => void;
  };
  registerSip: () => void;
  unregisterSip: () => void;
  answerCall: () => void;
  startCall: (destination: string) => void;
  stopCall: () => void;
  isMuted: () => boolean;
  mute: () => void;
  unmute: () => void;
  sendDtmf: (tones: string) => void;
  isHeld: () => {
    localHold: boolean;
    remoteHold: boolean;
  };
  hold: () => void;
  unhold: () => void;
}

export interface ISipState {
  sipStatus: SipStatusEnum;
  sipErrorType: SipErrorTypeEnum | null;
  sipErrorMessage: string | null;
  callStatus: CallStatusEnum;
  callDirection: CallDirectionEnum | null;
  callCounterpart: string | null;
  groupName: string | null;
  callId: string | null;
}
