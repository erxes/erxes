import {
  EnumCursorDirection,
  IAttachment,
  IRecordTableCursorPageInfo,
} from 'erxes-ui';
import { IUser } from '../../team-members/types/TeamMembers';

export type TStructureLegacyKind = 'branch' | 'department' | 'unit';

export type TStructureSeatCoverage = 'node' | 'below' | 'selected';

export interface IStructureEntityType {
  _id: string;
  name: string;
  code: string;
  description?: string;
  icon?: string;
  parentTypeIds?: string[];
  capabilities?: string[];
  legacyKind?: TStructureLegacyKind;
  isSystem?: boolean;
  entityCount?: number;
}

export interface IStructureLocation {
  address?: string;
  coordinate?: {
    latitude?: string;
    longitude?: string;
  };
  radius?: number;
}

export interface IStructureContact {
  phoneNumber?: string;
  email?: string;
  links?: Record<string, string>;
  image?: IAttachment;
}

export interface IStructureSchedule {
  workhours?: Record<string, unknown>;
  holidays?: Record<string, unknown>[];
}

export interface IStructureEntity {
  _id: string;
  typeId: string;
  type?: IStructureEntityType;
  parentId?: string;
  parent?: IStructureEntity;
  path?: IStructureEntity[];
  order: string;
  title: string;
  code?: string;
  description?: string;
  status?: string;
  location?: IStructureLocation;
  contact?: IStructureContact;
  schedule?: IStructureSchedule;
  propertiesData?: Record<string, unknown>;
  childCount?: number;
  memberCount?: number;
  seatCount?: number;
  archivedAt?: string;
}

export interface IStructurePositionGroup {
  _id: string;
  name: string;
  plugin?: string;
}

export interface IStructurePosition {
  _id: string;
  name: string;
  description?: string;
  groupIds?: string[];
  groups?: IStructurePositionGroup[];
  seatCount?: number;
  createdAt?: string;
}

export interface IStructureSeat {
  _id: string;
  positionId: string;
  position?: IStructurePosition;
  entityId: string;
  entity?: IStructureEntity;
  coverage: TStructureSeatCoverage;
  coveredEntityIds?: string[];
  coveredEntities?: IStructureEntity[];
  holders?: IUser[];
  holderCount?: number;
  createdAt?: string;
}

export interface IStructureEntityMember {
  _id: string;
  entityId: string;
  entity?: IStructureEntity;
  userId: string;
  user?: IUser;
  seatIds?: string[];
  seats?: IStructureSeat[];
  isPrimary?: boolean;
  startsAt?: string;
  endsAt?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface IStructureEntitiesFilter {
  typeIds?: string[];
  capability?: string;
  excludeIds?: string[];
  descendantOf?: string;
  includeArchived?: boolean;
}

export interface IStructureEntitiesVariables {
  ids?: string[];
  excludeIds?: boolean;
  typeIds?: string[];
  parentId?: string;
  descendantOf?: string;
  capability?: string;
  includeArchived?: boolean;
  searchValue?: string;
  limit?: number;
  cursor?: string | null;
  direction?: EnumCursorDirection;
}

export interface IStructureEntitiesData {
  structureEntities: {
    list: IStructureEntity[];
    totalCount: number;
    pageInfo: IRecordTableCursorPageInfo;
  };
}

export interface IStructureEntityDetailData {
  structureEntityDetail: IStructureEntity;
}

export interface IStructureEntityTypesVariables {
  searchValue?: string;
  capability?: string;
}

export interface IStructureEntityTypesData {
  structureEntityTypes: IStructureEntityType[];
}

export interface IStructureEntityTreeNode {
  entity: IStructureEntity;
  order: string;
  hasChildren: boolean;
}

export interface ISelectStructureEntitiesContext
  extends IStructureEntitiesFilter {
  entityIds: string[];
  selectedEntities: IStructureEntity[];
  mode: 'single' | 'multiple';
  onSelect: (entity: IStructureEntity) => void;
  onRemove: (entityId: string) => void;
}

export type ISelectStructureEntitiesProviderProps = IStructureEntitiesFilter & {
  value?: string[] | string;
  onValueChange?: (value?: string[] | string) => void;
  mode?: 'single' | 'multiple';
  children?: React.ReactNode;
};
