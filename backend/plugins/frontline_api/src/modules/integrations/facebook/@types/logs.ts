export interface IFacebookLog {
  type: string;
  value: any;
  specialValue: any;
  createdAt: Date;
}

export interface IFacebookLogInput {
  type: string;
  value: any;
  specialValue: any;
}

export interface IFacebookLogDocument extends IFacebookLog, Document {
  _id: string;
}
