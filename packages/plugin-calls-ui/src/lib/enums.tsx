export const SIP_STATUS_DISCONNECTED = 'sipStatus/DISCONNECTED';
export const SIP_STATUS_CONNECTING = 'sipStatus/CONNECTING';
export const SIP_STATUS_CONNECTED = 'sipStatus/CONNECTED';
export const SIP_STATUS_REGISTERED = 'sipStatus/REGISTERED';
export const SIP_STATUS_ERROR = 'sipStatus/ERROR';
export type SipStatus =
  | 'sipStatus/DISCONNECTED'
  | 'sipStatus/CONNECTING'
  | 'sipStatus/CONNECTED'
  | 'sipStatus/REGISTERED'
  | 'sipStatus/ERROR';

export const SIP_ERROR_TYPE_CONFIGURATION = 'sipErrorType/CONFIGURATION';
export const SIP_ERROR_TYPE_CONNECTION = 'sipErrorType/CONNECTION';
export const SIP_ERROR_TYPE_REGISTRATION = 'sipErrorType/REGISTRATION';
export type SipErrorType =
  | 'sipErrorType/CONFIGURATION'
  | 'sipErrorType/CONNECTION'
  | 'sipErrorType/REGISTRATION';

export const CALL_STATUS_IDLE = 'callStatus/IDLE';
export const CALL_STATUS_STARTING = 'callStatus/STARTING';
export const CALL_STATUS_ACTIVE = 'callStatus/ACTIVE';
export const CALL_STATUS_STOPPING = 'callStatus/STOPPING';
export type CallStatus =
  | 'callStatus/IDLE'
  | 'callStatus/STARTING'
  | 'callStatus/ACTIVE'
  | 'callStatus/STOPPING';

export const CALL_DIRECTION_INCOMING = 'callDirection/INCOMING';
export const CALL_DIRECTION_OUTGOING = 'callDirection/OUTGOING';
export type CallDirection = 'callDirection/INCOMING' | 'callDirection/OUTGOING';
