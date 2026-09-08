import { Document } from 'mongoose';

export interface IGrade {
  code: string;
  name: string;
  description?: string;
  rank?: number;
  baseSalary?: number;
  allowanceAmount?: number;
  allowanceRate?: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGradeDocument extends IGrade, Document {
  _id: string;
}
