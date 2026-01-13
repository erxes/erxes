import { Document } from 'mongoose'

export interface ILog {
    type: string;
    value: any;
    specialValue: any;
    createdAt: Date;
  }
  
  export interface ILogInput {
    type: string;
    value: any;
    specialValue: any;
  }
  
  export interface ILogDocument extends ILog, Document {
    _id: string;
  }