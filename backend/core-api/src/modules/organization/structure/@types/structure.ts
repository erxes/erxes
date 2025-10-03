import { ILink } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';

interface ICommonTypes {
  title: string;
  description?: string;
  supervisorId?: string;
  parentId?: string;
  code: string;
}
export interface IStructure extends ICommonTypes {
  links?: ILink;
}

export interface IStructureDocument extends IStructure, Document {
  _id: string;
}

export interface IDepartment extends ICommonTypes {
  parentId?: string;
  userIds?: string[];
  order: string;
}

export interface IDepartmentDocument extends IDepartment, Document {
  _id: string;
}

export interface IUnit extends ICommonTypes {
  departmentId?: string;
  userIds?: string[];
  order: string;
}

export interface IUnitDocument extends IUnit, Document {
  _id: string;
}

export interface IBranch extends ICommonTypes {
  address?: string;
  userIds?: string[];
  radius?: number;
  order: string;
}

export interface IBranchDocument extends IBranch, Document {
  _id: string;
}

export interface IPosition extends ICommonTypes {
  userIds?: string[];
  order: string;
  status: string;
}

export interface IPositionDocument extends IPosition, Document {
  _id: string;
}
