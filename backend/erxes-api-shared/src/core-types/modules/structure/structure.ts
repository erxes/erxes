import { Document } from 'mongoose';

export interface IStructureCommonTypes {
  title: string;
  description?: string;
  supervisorId?: string;
  parentId?: string;
  code: string;
}

export interface IDepartment extends IStructureCommonTypes {
  parentId?: string;
  userIds?: string[];
  order: string;
}

export interface IDepartmentDocument extends IDepartment, Document {
  _id: string;
}
export interface IBranch extends IStructureCommonTypes {
  address?: string;
  userIds?: string[];
  radius?: number;
  order: string;
}

export interface IBranchDocument extends IBranch, Document {
  _id: string;
}
