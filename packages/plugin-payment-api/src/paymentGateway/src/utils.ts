import { Buffer } from 'buffer';
import queryString from 'query-string';

import { IPaymentParams } from './types';

export const docodeQueryParams = (data: string) => {
  const queryParams = queryString.parse(data);

  const base64str = queryParams.q;
  const parsedData: string = Buffer.from(
    base64str as string,
    'base64'
  ).toString('ascii');
  return JSON.parse(parsedData) as IPaymentParams;
};
