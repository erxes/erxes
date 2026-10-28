import { useMutation } from '@apollo/client';
import {
  STRUCTURE_ENTITIES_ADD,
  STRUCTURE_ENTITIES_ARCHIVE,
  STRUCTURE_ENTITIES_EDIT,
  STRUCTURE_ENTITIES_MOVE,
  STRUCTURE_ENTITIES_RESTORE,
  STRUCTURE_ENTITY_TYPES_ADD,
  STRUCTURE_ENTITY_TYPES_EDIT,
  STRUCTURE_ENTITY_TYPES_REMOVE,
} from '../graphql/structureEntityMutations';
import {
  IStructureEntityAddVariables,
  IStructureEntityEditVariables,
  IStructureEntityTypeVariables,
} from '../types/structureEntity';

type TMutationResult = { _id: string };

const STRUCTURE_TREE_REFETCH = [
  'StructureEntitiesTree',
  'StructureEntityDetail',
  'StructureEntityTypesList',
  'StructureEntitiesSelect',
  'StructureEntityDetailSelect',
];

const STRUCTURE_ENTITY_TYPE_REFETCH = [
  'StructureEntityTypesList',
  'StructureEntityDetail',
  'StructureEntityTypesSelect',
  'StructureEntitiesSelect',
];

export const useStructureEntityMutations = () => {
  const treeOptions = {
    refetchQueries: STRUCTURE_TREE_REFETCH,
    awaitRefetchQueries: true,
  };

  const [addEntity, addState] = useMutation<
    { structureEntitiesAdd: TMutationResult },
    IStructureEntityAddVariables
  >(STRUCTURE_ENTITIES_ADD, treeOptions);

  const [editEntity, editState] = useMutation<
    { structureEntitiesEdit: TMutationResult },
    IStructureEntityEditVariables
  >(STRUCTURE_ENTITIES_EDIT);

  const [moveEntity, moveState] = useMutation<
    { structureEntitiesMove: TMutationResult },
    { _id: string; parentId: string }
  >(STRUCTURE_ENTITIES_MOVE, treeOptions);

  const [archiveEntity, archiveState] = useMutation<
    { structureEntitiesArchive: TMutationResult },
    { _id: string }
  >(STRUCTURE_ENTITIES_ARCHIVE, treeOptions);

  const [restoreEntity, restoreState] = useMutation<
    { structureEntitiesRestore: TMutationResult },
    { _id: string }
  >(STRUCTURE_ENTITIES_RESTORE, treeOptions);

  return {
    addEntity,
    editEntity,
    moveEntity,
    archiveEntity,
    restoreEntity,
    adding: addState.loading,
    editing: editState.loading,
    moving: moveState.loading,
    archiving: archiveState.loading || restoreState.loading,
  };
};

export const useStructureEntityTypeMutations = () => {
  const options = {
    refetchQueries: STRUCTURE_ENTITY_TYPE_REFETCH,
    awaitRefetchQueries: true,
  };

  const [addType, addState] = useMutation<
    { structureEntityTypesAdd: TMutationResult },
    IStructureEntityTypeVariables
  >(STRUCTURE_ENTITY_TYPES_ADD, options);

  const [editType, editState] = useMutation<
    { structureEntityTypesEdit: TMutationResult },
    Partial<IStructureEntityTypeVariables> & { _id: string }
  >(STRUCTURE_ENTITY_TYPES_EDIT, options);

  const [removeType, removeState] = useMutation<
    { structureEntityTypesRemove: TMutationResult },
    { _id: string }
  >(STRUCTURE_ENTITY_TYPES_REMOVE, options);

  return {
    addType,
    editType,
    removeType,
    saving: addState.loading || editState.loading,
    removing: removeState.loading,
  };
};
