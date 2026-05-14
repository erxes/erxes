export interface IWebActivityLog {
  webId: string;
  userId?: string;
  action: string;
  changes: {
    field: string;
    from: any;
    to: any;
  }[];
  createdAt: Date;
}

export interface IWebActivityLogDocument extends IWebActivityLog, Document {
  _id: string;
}
