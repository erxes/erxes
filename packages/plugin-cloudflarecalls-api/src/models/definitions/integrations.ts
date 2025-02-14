import { Schema, Document } from 'mongoose';
import { field } from './utils';

export interface Operator {
  userId: string;
  gsUsername: string;
  gsPassword: string;
  gsForwardAgent: boolean;
}

export interface Department {
  _id: string;
  name: string;
  operators: [Operator];
}
export interface IIntegration {
  erxesApiId: String;
  departments: [Department];
  status: string;
  isReceiveWebCall: boolean;
}

export interface IIntegrationDocument extends IIntegration, Document {}

const operatorSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    default: '',
  },
});

// Define the Department schema
const departmentSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  operators: {
    type: [operatorSchema],
    default: [],
  },
});

export const integrationSchema = new Schema({
  _id: field({ pkey: true }),
  erxesApiId: field({ type: String, label: 'integration id' }),
  operators: field({ type: Object, label: 'Operator maps' }),
  name: field({ type: String, label: 'integration name for web users' }),
  departments: field({
    type: [departmentSchema],
    label: 'integration departments',
  }),
  status: field({ type: String, label: 'status' }),
});
