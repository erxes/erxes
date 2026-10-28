import { Document } from 'mongoose';
import { IAttachment, ILink, IPropertyField } from '../../common';

export type TStructureLegacyKind = 'branch' | 'department' | 'unit';

export type TStructureSeatCoverage = 'node' | 'below' | 'selected';

export interface IStructurePosition {
  name: string;
  description?: string;
  groupIds: string[];
}

export interface IStructurePositionDocument
  extends IStructurePosition,
    Document {
  _id: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStructureSeat {
  positionId: string;
  entityId: string;
  coverage: TStructureSeatCoverage;
  coveredEntityIds: string[];
}

export interface IStructureSeatDocument extends IStructureSeat, Document {
  _id: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStructureEntityType {
  name: string;
  code: string;
  description?: string;
  icon?: string;
  parentTypeIds?: string[];
  capabilities?: string[];
  legacyKind?: TStructureLegacyKind;
  isSystem?: boolean;
}

export interface IStructureEntityTypeDocument
  extends IStructureEntityType,
    Document {
  _id: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStructureCoordinate {
  latitude?: string;
  longitude?: string;
}

export interface IStructureLocation {
  address?: string;
  coordinate?: IStructureCoordinate;
  radius?: number;
}

export interface IStructureContact {
  phoneNumber?: string;
  email?: string;
  links?: ILink;
  image?: IAttachment;
}

export interface IStructureSchedule {
  workhours?: Record<string, unknown>;
  holidays?: Record<string, unknown>[];
}

export interface IStructureEntity {
  typeId: string;
  parentId?: string;
  order: string;
  title: string;
  code?: string;
  description?: string;
  status?: string;
  location?: IStructureLocation;
  contact?: IStructureContact;
  schedule?: IStructureSchedule;
  propertiesData?: IPropertyField;
  archivedAt?: Date;
  archivedBy?: string;
}

export interface IStructureEntityDocument extends IStructureEntity, Document {
  _id: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStructureEntityMember {
  entityId: string;
  userId: string;
  seatIds: string[];
  isPrimary?: boolean;
  startsAt?: Date;
  endsAt?: Date;
}

export interface IStructureEntityMemberDocument
  extends IStructureEntityMember,
    Document {
  _id: string;
  createdBy?: string;
  endedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStructureUserContext {
  primaryEntityId?: string;
  entityIds: string[];
  principalEntityIds: string[];
  boundaryEntityIds: string[];
  boundaryUserIds: string[];
}

export interface IStructurePluginCapability {
  key: string;
  label: string;
  description?: string;
}

export interface IStructureMeta {
  capabilities?: IStructurePluginCapability[];
}
