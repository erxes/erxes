import { REACT_APP_API_URL } from 'erxes-ui';

export const filesShareUrl = (token: string) =>
  `${REACT_APP_API_URL}/pl:core/files/s/${token}`;
