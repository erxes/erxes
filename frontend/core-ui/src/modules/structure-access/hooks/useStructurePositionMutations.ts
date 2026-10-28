import { useMutation } from '@apollo/client';
import {
  STRUCTURE_ACCESS_POSITION_ADD,
  STRUCTURE_ACCESS_POSITION_EDIT,
  STRUCTURE_ACCESS_POSITION_REMOVE,
} from '../graphql/structureAccessMutations';
import { IStructurePositionInput } from '../types';

const POSITION_REFETCH = [
  'StructureAccessPositions',
  'StructureAccessSeats',
  'StructureAccessMembers',
  'CurrentUserPermissions',
  'permissionGroups',
];

type TMutationResult = { _id: string };

export const useStructurePositionMutations = () => {
  const options = {
    refetchQueries: POSITION_REFETCH,
    awaitRefetchQueries: true,
  };

  const [addPosition, addState] = useMutation<
    { structurePositionsAdd: TMutationResult },
    IStructurePositionInput
  >(STRUCTURE_ACCESS_POSITION_ADD, options);

  const [editPosition, editState] = useMutation<
    { structurePositionsEdit: TMutationResult },
    IStructurePositionInput & { _id: string }
  >(STRUCTURE_ACCESS_POSITION_EDIT, options);

  const [removePosition, removeState] = useMutation<
    { structurePositionsRemove: TMutationResult },
    { _id: string }
  >(STRUCTURE_ACCESS_POSITION_REMOVE, options);

  return {
    addPosition,
    editPosition,
    removePosition,
    saving: addState.loading || editState.loading,
    removing: removeState.loading,
  };
};
