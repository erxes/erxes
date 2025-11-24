import { Document } from 'mongoose';
import { ICursorPaginateParams } from '../../common';

export enum Roles {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}
export interface IRole {
  userId: string;
  role: Roles;
}

export interface IRoleDocument extends IRole, Document {
  _id: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface IRoleParams extends ICursorPaginateParams {
  userId: string;
  role: Roles;
}