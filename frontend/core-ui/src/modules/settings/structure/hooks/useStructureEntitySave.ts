import { IStructureEntityEditVariables } from '../types/structureEntity';
import { useStructureEntityMutations } from './useStructureEntityMutations';
import { useStructureFeedback } from './useStructureFeedback';

export const useStructureEntitySave = () => {
  const { editEntity, editing } = useStructureEntityMutations();
  const { success, failure } = useStructureFeedback();

  const save = async (
    variables: IStructureEntityEditVariables,
    message: string,
  ) => {
    try {
      await editEntity({ variables });
      success(message);

      return true;
    } catch (error) {
      failure(error);

      return false;
    }
  };

  return { save, saving: editing };
};
