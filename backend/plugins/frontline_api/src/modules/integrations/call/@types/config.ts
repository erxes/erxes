export interface ICallConfig {
  code: string;
  value: any;
}

export interface ICallConfigDocument extends ICallConfig, Document {
  _id: string;
}
