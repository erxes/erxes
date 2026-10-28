import type {
  IStructureAccessMember,
  IStructureMemberInput,
} from '@/structure-access';
import type { TStructureTreeEntity } from '../types/structureEntity';
import { isStructureEntityArchived } from './structureEntityStatus';
import { canMoveStructureEntity } from './structureTree';

export interface IStructureDragMembership {
  _id: string;
  entityId: string;
  isPrimary?: boolean;
}

export interface IStructureDragPerson {
  userId: string;
  name: string;
  avatar?: string;
  membership?: IStructureDragMembership;
}

export type TStructureDragItem =
  | { kind: 'entity'; entity: TStructureTreeEntity }
  | { kind: 'person'; person: IStructureDragPerson };

export type TStructurePersonDropPlan =
  | { kind: 'add'; add: IStructureMemberInput }
  | { kind: 'move'; add: IStructureMemberInput; endMemberId: string };

export type TStructureDropResult =
  | { kind: 'invalid' }
  | { kind: 'move-entity'; entityId: string; parentId: string }
  | { kind: 'person'; plan: TStructurePersonDropPlan };

const INVALID_DROP: TStructureDropResult = { kind: 'invalid' };

export const toStructureDragPerson = ({
  _id,
  entityId,
  userId,
  isPrimary,
  user,
}: Pick<
  IStructureAccessMember,
  '_id' | 'entityId' | 'userId' | 'isPrimary' | 'user'
>): IStructureDragPerson => ({
  userId,
  name: user?.details?.fullName || user?.email || userId,
  avatar: user?.details?.avatar,
  membership: { _id, entityId, isPrimary },
});

export const resolveStructureDrop = ({
  item,
  target,
  copy,
}: {
  item: TStructureDragItem;
  target: TStructureTreeEntity;
  copy: boolean;
}): TStructureDropResult => {
  if (isStructureEntityArchived(target)) {
    return INVALID_DROP;
  }

  if (item.kind === 'entity') {
    const { entity } = item;

    return !isStructureEntityArchived(entity) &&
      canMoveStructureEntity(entity, target)
      ? { kind: 'move-entity', entityId: entity._id, parentId: target._id }
      : INVALID_DROP;
  }

  const { userId, membership } = item.person;

  if (membership?.entityId === target._id) {
    return INVALID_DROP;
  }

  const add = { entityId: target._id, userId };

  if (!membership || copy) {
    return { kind: 'person', plan: { kind: 'add', add } };
  }

  return {
    kind: 'person',
    plan: {
      kind: 'move',
      add: { ...add, isPrimary: Boolean(membership.isPrimary) },
      endMemberId: membership._id,
    },
  };
};

export const runStructurePersonDrop = async (
  plan: TStructurePersonDropPlan,
  {
    addMember,
    endMember,
  }: {
    addMember: (input: IStructureMemberInput) => Promise<unknown>;
    endMember: (memberId: string) => Promise<unknown>;
  },
) => {
  await addMember(plan.add);

  if (plan.kind === 'move') {
    await endMember(plan.endMemberId);
  }
};
