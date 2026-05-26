import { Document } from 'mongoose';

export interface IBranch {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  managerId?: string;
  employeeIds?: string[];
  isActive?: boolean;
  code?: string;
  description?: string;
  order?: number;
  parentId?: string;
  supervisorId?: string;
  createdAt?: Date;
  modifiedAt?: Date;
}

export interface IBranchDocument extends IBranch, Document {
  _id: string;
}
