export interface IFacebookConfig {
  code: string;
  value: any;
}

export interface IFacebookConfigDocument extends IFacebookConfig, Document {
  _id: string;
}
