import type { IAttachment, IRecordTableCursorPageInfo } from 'erxes-ui';
import type {
  IStructureEntity,
  IStructureEntityType,
  IStructureLocation,
} from 'ui-modules';

export type TStructureTreeEntity = Pick<
  IStructureEntity,
  | '_id'
  | 'typeId'
  | 'parentId'
  | 'order'
  | 'title'
  | 'code'
  | 'status'
  | 'archivedAt'
  | 'memberCount'
  | 'seatCount'
>;

export interface IStructureTreeRow<T extends TStructureTreeEntity> {
  entity: T;
  depth: number;
  hasChildren: boolean;
  expanded: boolean;
}

export type IStructureEntityTypeDetail = IStructureEntityType;

export interface IStructureEntityPathItem {
  _id: string;
  title: string;
  code?: string;
  location?: IStructureLocation | null;
}

export interface IStructureEntityDetail
  extends Omit<IStructureEntity, 'type' | 'path'> {
  type?: IStructureEntityTypeDetail;
  path?: IStructureEntityPathItem[];
}

export interface IStructureCapability {
  key: string;
  label: string;
  description?: string;
  plugin: string;
}

export const STRUCTURE_LINK_NAMES = [
  'website',
  'facebook',
  'whatsapp',
  'twitter',
  'youtube',
] as const;

export type TStructureLinkName = (typeof STRUCTURE_LINK_NAMES)[number];

export type TStructureImage = Pick<IAttachment, 'url' | 'name'> &
  Partial<Pick<IAttachment, 'type' | 'size'>>;

export interface IStructureLocationForm {
  location: {
    address: string;
    coordinate: { latitude?: string; longitude?: string } | null;
    radius: number;
  };
}

export interface IStructureContactForm {
  contact: {
    phoneNumber: string;
    email: string;
    links: Record<TStructureLinkName, string>;
    image: TStructureImage | null;
  };
}

export interface IStructureLocationInput {
  address?: string;
  coordinate?: { latitude: string; longitude: string };
  radius?: number;
}

export interface IStructureContactInput {
  phoneNumber?: string;
  email?: string;
  links?: Partial<Record<TStructureLinkName, string>>;
  image?: TStructureImage;
}

export interface IStructureEntityEditVariables {
  _id: string;
  title?: string;
  code?: string;
  description?: string;
  location?: IStructureLocationInput;
  contact?: IStructureContactInput;
  schedule?: {
    workhours: Record<string, unknown> | null;
    holidays: unknown[];
  };
  propertiesData?: Record<string, unknown>;
}

export interface IStructureEntityAddVariables {
  typeId: string;
  parentId: string;
  title: string;
}

export interface IStructureEntitiesTreeData {
  structureEntities: {
    list: TStructureTreeEntity[];
    totalCount: number;
    pageInfo: IRecordTableCursorPageInfo;
  };
}

export interface IStructureEntitiesTreeVariables {
  includeArchived?: boolean;
  limit?: number;
  cursor?: string | null;
  direction?: string;
}

export type TStructureLegacyKindOption =
  | NonNullable<IStructureEntityType['legacyKind']>
  | 'none';

export interface IStructureEntityTypeForm {
  name: string;
  icon: string;
  parentTypeIds: string[];
  legacyKind: TStructureLegacyKindOption;
  capabilities: string[];
}

export interface IStructureEntityTypeVariables {
  name: string;
  code?: string;
  icon: string;
  parentTypeIds?: string[];
  legacyKind?: NonNullable<IStructureEntityType['legacyKind']> | null;
  capabilities: string[];
}
