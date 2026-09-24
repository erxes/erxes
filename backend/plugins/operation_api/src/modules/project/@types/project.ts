import { TCreatedVia } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';
import {
  ICursorPaginateParams,
  IListParams,
} from 'erxes-api-shared/core-types';

export interface IProject {
  /**
   * What produced this, when nobody typed it in — a campaign, an
   * automation. Written by whatever created it; `schemaWrapper` carries
   * the field on every schema.
   */
  createdVia?: TCreatedVia;
  name: string;
  description?: string;
  teamIds: string[];
  tagIds?: string[];
  priority: number;
  startDate?: Date;
  status: number;
  targetDate?: Date;
  leadId?: string;
  memberIds?: string[];
  createdBy?: string;
  convertedFromId?: string;
  propertiesData?: Record<string, unknown>;
}

export interface IProjectFilter extends ICursorPaginateParams, IListParams {
  _ids?: string[];
  name?: string;
  description?: string;
  teamIds?: string[];
  tagIds?: string[];
  priority: number;
  startDate?: Date;
  targetDate?: Date;
  leadId?: string;
  memberIds?: string[];
  memberId?: string;
  status?: number;
  userId?: string;
  active?: boolean;
  taskId?: string;
}

export interface IProjectUpdate extends IProject {
  _id: string;
}

export interface IProjectDocument extends IProject, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
