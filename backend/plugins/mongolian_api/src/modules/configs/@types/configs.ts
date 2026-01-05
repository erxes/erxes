export type ConfigCode =
  | 'ebarimt'
  | 'tax'
  | 'productRules'
  | 'general';

export interface IConfigInput<T = any> {
  code: ConfigCode;
  value: T;
}

export interface IConfig<T = any> {
  _id: string;
  code: string;
  value: T;
}

export interface IEbarimtConfig {
  ebarimtUrl: string;
  posNo: string;
  districtCode: string;
  branchNo: string;
  merchantTin: string;

  // auth
  username?: string;
  password?: string;
  token?: string;

  // behavior flags
  retrySeconds?: number;
  allowRePut?: boolean;
}
