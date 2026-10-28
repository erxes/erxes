import type { IStructureAccessSeat } from '@/structure-access';

export interface IStructureSeatNode {
  entityId: string;
  entity?: IStructureAccessSeat['entity'];
  isRoot: boolean;
  seats: IStructureAccessSeat[];
}

const isRootOrder = (order?: string) =>
  !!order && order.split('/').filter(Boolean).length === 1;

const rankOf = ({ isRoot, entity }: IStructureSeatNode) => {
  if (isRoot) {
    return 0;
  }

  return entity ? 1 : 2;
};

export const groupSeatsByNode = (
  seats: IStructureAccessSeat[],
): IStructureSeatNode[] => {
  const nodes = new Map<string, IStructureSeatNode>();

  for (const seat of seats) {
    const node = nodes.get(seat.entityId) ?? {
      entityId: seat.entityId,
      entity: seat.entity,
      isRoot: isRootOrder(seat.entity?.order),
      seats: [],
    };

    node.seats.push(seat);
    nodes.set(seat.entityId, node);
  }

  return [...nodes.values()].sort(
    (a, b) =>
      rankOf(a) - rankOf(b) ||
      (a.entity?.order ?? '').localeCompare(b.entity?.order ?? ''),
  );
};
