import { Document } from 'mongoose';

interface IDetail {
  avatar?: string;
  fullName?: string;
  shortName?: string;
  position?: string;
  birthDate?: Date;
  workStartedDate?: Date;
  location?: string;
  description?: string;
  operatorPhone?: string;
}

export interface IPosUser {
  createdAt?: Date;
  username?: string;
  password: string;
  isOwner?: boolean;
  email?: string;
  isActive?: boolean;
  details?: IDetail;
}

export interface IPosUserDocument extends IPosUser, Document {
  _id: string;
  tokens: string[];
}
