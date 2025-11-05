import { Document } from 'mongoose';
import {
  ICursorPaginateParams,
  IListParams,
} from 'erxes-api-shared/core-types';

export interface ITriage {
  name: string;
  description: string;
  teamId: string;
  createdBy: string;
  type: string;
  number: number;
  priority: number;
}

export interface ITriageUpdate extends ITriage {
  _id: string;
}

export interface ITriageDocument extends ITriage, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITriageFilter
  extends ICursorPaginateParams,
    IListParams,
    ITriage {
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITriageInput {
  name: string;
  description: string;
  teamId: string;
  priority: number;
}
