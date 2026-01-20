import { Document } from 'mongoose'

export interface ILog {
    type: string;
    value: any;
    specialValue: any;
    createdAt: Date;
  }
  
  export interface IInstagramLogInput {
    type: string;
    value: any;
    specialValue: any;
  }
  
  export interface IInstagramLogDocument extends ILog, Document {
    _id: string;
  }