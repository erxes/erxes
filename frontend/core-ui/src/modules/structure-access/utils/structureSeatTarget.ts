import { NEW_STRUCTURE_SEAT } from '../schemas/structureSeatTarget';
import type { TStructureSeatTargetForm } from '../schemas/structureSeatTarget';
import type { IStructureSeatInput } from '../types';

export type TStructureSeatTarget =
  | { kind: 'existing'; seatId: string }
  | { kind: 'new'; input: IStructureSeatInput };

export const toStructureSeatTarget = ({
  entityId,
  seatId,
  positionId,
  coverage,
  coveredEntityIds,
}: TStructureSeatTargetForm): TStructureSeatTarget => {
  if (seatId !== NEW_STRUCTURE_SEAT) {
    return { kind: 'existing', seatId };
  }

  return {
    kind: 'new',
    input: {
      entityId,
      positionId,
      coverage,
      coveredEntityIds: coverage === 'selected' ? coveredEntityIds : [],
    },
  };
};

export const resolveStructureSeatTarget = async (
  values: TStructureSeatTargetForm,
  addSeat: (input: IStructureSeatInput) => Promise<string | undefined>,
) => {
  const target = toStructureSeatTarget(values);

  if (target.kind === 'existing') {
    return target.seatId;
  }

  return addSeat(target.input);
};
