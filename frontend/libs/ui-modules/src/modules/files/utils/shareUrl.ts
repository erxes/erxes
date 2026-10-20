import { REACT_APP_API_URL } from 'erxes-ui';

// Built like read-file links: the API URL already resolves localhost vs a SaaS subdomain.
export const filesShareUrl = (token: string) =>
  `${REACT_APP_API_URL}/pl:core/files/s/${token}`;
