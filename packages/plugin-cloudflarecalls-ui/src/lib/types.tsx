import * as PropTypes from 'prop-types';

export interface ExtraHeaders {
  register?: string[];
  invite?: string[];
}
export const extraHeadersPropType = PropTypes.objectOf(
  PropTypes.arrayOf(PropTypes.string),
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
