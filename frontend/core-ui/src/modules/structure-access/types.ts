import {
  IStructureEntityMember,
  IStructurePosition,
  IStructureSeat,
  TStructureSeatCoverage,
} from 'ui-modules';

export interface IStructureAccessUser {
  _id: string;
  email?: string;
  details?: {
    avatar?: string;
    fullName?: string;
  };
}

export interface IStructureAccessEntity {
  _id: string;
  title: string;
  code?: string;
  order: string;
  status?: string;
  typeId: string;
  type?: {
    _id: string;
    name: string;
    code: string;
  };
}

export interface IStructureAccessMemberSeat {
  _id: string;
  coverage: TStructureSeatCoverage;
  position?: Pick<IStructurePosition, '_id' | 'name'>;
}

export interface IStructureAccessMember
  extends Omit<IStructureEntityMember, 'entity' | 'user' | 'seats'> {
  isActive?: boolean;
  entity?: IStructureAccessEntity;
  user?: IStructureAccessUser;
  seats?: IStructureAccessMemberSeat[];
}

export interface IStructureAccessPosition extends IStructurePosition {
  seatCount: number;
}

export interface IStructureAccessSeat
  extends Omit<
    IStructureSeat,
    'position' | 'entity' | 'coveredEntities' | 'holders'
  > {
  position?: Pick<IStructurePosition, '_id' | 'name' | 'groupIds' | 'groups'>;
  entity?: IStructureAccessEntity;
  coveredEntities?: Pick<IStructureAccessEntity, '_id' | 'title' | 'code'>[];
  holders?: IStructureAccessUser[];
}

export interface IStructureMemberInput {
  entityId: string;
  userId: string;
  isPrimary?: boolean;
  startsAt?: string;
  endsAt?: string;
}

export interface IStructurePositionInput {
  name: string;
  description?: string;
  groupIds: string[];
}

export interface IStructureSeatInput {
  entityId: string;
  positionId: string;
  coverage: TStructureSeatCoverage;
  coveredEntityIds: string[];
}
