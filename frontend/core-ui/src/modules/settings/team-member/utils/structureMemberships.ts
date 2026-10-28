import type { IStructureAccessMember } from '@/structure-access';

type TMembershipSeats = {
  seatIds?: string[];
  seats?: { _id: string; position?: { name: string } }[];
};

const rankOf = ({ isActive, isPrimary }: IStructureAccessMember) => {
  if (isActive === false) {
    return 2;
  }

  return isPrimary ? 0 : 1;
};

const endTimeOf = ({ endsAt }: IStructureAccessMember) =>
  endsAt ? new Date(endsAt).getTime() : 0;

export const orderMemberships = (members: IStructureAccessMember[]) =>
  [...members].sort(
    (a, b) =>
      rankOf(a) - rankOf(b) ||
      (rankOf(a) === 2 ? endTimeOf(b) - endTimeOf(a) : 0),
  );

export const getMembershipSeatLabels = ({
  seatIds,
  seats,
}: TMembershipSeats) => {
  const names = new Map(
    (seats ?? []).map(({ _id, position }) => [_id, position?.name]),
  );

  return (seatIds ?? [...names.keys()]).map((id) => names.get(id) || id);
};
