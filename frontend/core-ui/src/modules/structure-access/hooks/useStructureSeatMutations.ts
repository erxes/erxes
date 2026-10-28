import { useMutation } from '@apollo/client';
import {
  STRUCTURE_ACCESS_SEAT_ADD,
  STRUCTURE_ACCESS_SEAT_EDIT,
  STRUCTURE_ACCESS_SEAT_HOLDERS_ADD,
  STRUCTURE_ACCESS_SEAT_HOLDERS_REMOVE,
  STRUCTURE_ACCESS_SEAT_REMOVE,
} from '../graphql/structureAccessMutations';
import { IStructureSeatInput } from '../types';
import { STRUCTURE_ACCESS_REFETCH } from './useStructureAccessMutations';

const SEAT_REFETCH = [
  ...STRUCTURE_ACCESS_REFETCH,
  'StructureAccessPositions',
  'StructureEntitiesTree',
  'StructureEntityDetail',
];

type TMutationResult = { _id: string };

export const useStructureSeatMutations = () => {
  const options = { refetchQueries: SEAT_REFETCH, awaitRefetchQueries: true };

  const [addSeat, addSeatState] = useMutation<
    { structureSeatsAdd: TMutationResult },
    IStructureSeatInput
  >(STRUCTURE_ACCESS_SEAT_ADD, options);

  const [editSeat, editSeatState] = useMutation<
    { structureSeatsEdit: TMutationResult },
    Pick<IStructureSeatInput, 'coverage' | 'coveredEntityIds'> & {
      _id: string;
    }
  >(STRUCTURE_ACCESS_SEAT_EDIT, options);

  const [removeSeat, removeSeatState] = useMutation<
    { structureSeatsRemove: TMutationResult },
    { _id: string }
  >(STRUCTURE_ACCESS_SEAT_REMOVE, options);

  const [addHolders, addHoldersState] = useMutation<
    { structureSeatHoldersAdd: TMutationResult },
    { seatId: string; userIds: string[] }
  >(STRUCTURE_ACCESS_SEAT_HOLDERS_ADD, options);

  const [removeHolder, removeHolderState] = useMutation<
    { structureSeatHoldersRemove: TMutationResult },
    { seatId: string; userId: string }
  >(STRUCTURE_ACCESS_SEAT_HOLDERS_REMOVE, options);

  return {
    addSeat,
    editSeat,
    removeSeat,
    addHolders,
    removeHolder,
    loading:
      addSeatState.loading ||
      editSeatState.loading ||
      removeSeatState.loading ||
      addHoldersState.loading ||
      removeHolderState.loading,
  };
};
