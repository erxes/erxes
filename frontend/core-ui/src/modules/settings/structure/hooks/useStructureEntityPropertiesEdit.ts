import { IMutateCallbacks } from 'ui-modules';
import { isRecord } from '../utils/structureSchedule';
import { useStructureEntityMutations } from './useStructureEntityMutations';
import { useStructureFeedback } from './useStructureFeedback';

export const useStructureEntityPropertiesEdit = () => {
  const { editEntity, editing } = useStructureEntityMutations();
  const { failure } = useStructureFeedback();

  return {
    mutate: (
      { _id, propertiesData }: { _id: string } & Record<string, unknown>,
      callbacks?: IMutateCallbacks,
    ) =>
      editEntity({
        variables: {
          _id,
          propertiesData: isRecord(propertiesData) ? propertiesData : {},
        },
        onCompleted: () => callbacks?.onCompleted?.(),
        onError: (error) => {
          failure(error);
          callbacks?.onError?.();
        },
      }),
    loading: editing,
  };
};
