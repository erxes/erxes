import { useMutation } from '@apollo/client';
import {
  STRUCTURE_ACCESS_MEMBER_ADD,
  STRUCTURE_ACCESS_MEMBER_EDIT,
  STRUCTURE_ACCESS_MEMBER_END,
} from '../graphql/structureAccessMutations';
import { IStructureMemberInput } from '../types';

export const STRUCTURE_ACCESS_REFETCH = [
  'StructureAccessMembers',
  'StructureAccessSeats',
  'CurrentUserPermissions',
  'permissionGroups',
  'Users',
];

type TMutationResult = { _id: string };

export const useStructureAccessMutations = () => {
  const options = {
    refetchQueries: STRUCTURE_ACCESS_REFETCH,
    awaitRefetchQueries: true,
  };

  const [addMember, addMemberState] = useMutation<
    { structureEntityMembersAdd: TMutationResult },
    IStructureMemberInput
  >(STRUCTURE_ACCESS_MEMBER_ADD, options);

  const [editMember, editMemberState] = useMutation<
    { structureEntityMembersEdit: TMutationResult },
    { _id: string; isPrimary?: boolean; endsAt?: string }
  >(STRUCTURE_ACCESS_MEMBER_EDIT, options);

  const [endMember, endMemberState] = useMutation<
    { structureEntityMembersEnd: TMutationResult },
    { _id: string; endsAt?: string }
  >(STRUCTURE_ACCESS_MEMBER_END, options);

  return {
    addMember,
    editMember,
    endMember,
    loading:
      addMemberState.loading ||
      editMemberState.loading ||
      endMemberState.loading,
  };
};
