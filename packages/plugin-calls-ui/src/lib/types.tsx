import * as PropTypes from 'prop-types';

export interface ExtraHeaders {
  register?: string[];
  invite?: string[];
}
export const extraHeadersPropType = PropTypes.objectOf(
  PropTypes.arrayOf(PropTypes.string)
);

// https://developer.mozilla.org/en-US/docs/Web/API/RTCIceServer
export type IceServers = Array<{
  urls: string | string[];
  username?: string;
  credential?: string;
  credentialType?: string;
  password?: string;
}>;
export const iceServersPropType = PropTypes.arrayOf(PropTypes.object);

export interface Sip {
  status?: string;
  errorType?: string;
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
export const sipPropType = PropTypes.shape({
  status: PropTypes.string,
  errorType: PropTypes.string,
  errorMessage: PropTypes.string,

  host: PropTypes.string,
  port: PropTypes.number,
  user: PropTypes.string,
  password: PropTypes.string,
  autoRegister: PropTypes.bool,
  autoAnswer: PropTypes.bool,
  sessionTimersExpires: PropTypes.number,
  extraHeaders: extraHeadersPropType,
  iceServers: iceServersPropType,
  debug: PropTypes.bool
});

export interface Call {
  id: string;
  status: string;
  direction: string;
  counterpart: string;
}
export const callPropType = PropTypes.shape({
  id: PropTypes.string,
  status: PropTypes.string,
  direction: PropTypes.string,
  counterpart: PropTypes.string
});

export const RTC = PropTypes.shape({
  id: PropTypes.string,
  connection: PropTypes.any,
  audioMuted: PropTypes.bool,
  _id: PropTypes.string,
  _connection: PropTypes.any,
  _audioMuted: PropTypes.bool
});

export const rtcSessionPropType = PropTypes.shape({
  id: PropTypes.number,
  description: PropTypes.string
  // Add more specific properties and their PropTypes here
});
