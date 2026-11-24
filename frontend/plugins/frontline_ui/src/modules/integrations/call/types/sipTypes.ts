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

export type IceServers = RTCIceServer[];

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
  sessionTimersExpires?: number;
  extraHeaders?: ExtraHeaders;
  iceServers?: IceServers;
  debug?: boolean;
}
export interface ReconnectSipOptions {
  /** Register after connecting; defaults to the saved Turn on/off choice. */
  register?: boolean;
}

export interface SipContextValue {
  registerSip: () => void;
  unregisterSip: () => void;
  reconnectSip: (options?: ReconnectSipOptions) => void;
  answerCall: () => void;
  /** True while Answer is in flight for the ringing session. */
  answering: boolean;
  startCall: (destination: string) => void;
  stopCall: () => void;
  muted: boolean;
  mute: () => void;
  unmute: () => void;
  sendDtmf: (tones: string) => void;
  held: boolean;
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
