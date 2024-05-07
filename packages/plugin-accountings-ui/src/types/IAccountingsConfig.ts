export interface IAccountingsConfig {
  code: string;
  value: any;
}

export interface IAccountingsConfigDocument
  extends IAccountingsConfig {
  _id: string;
}