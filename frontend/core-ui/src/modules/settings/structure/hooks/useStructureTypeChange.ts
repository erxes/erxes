import { useMutation } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { STRUCTURE_ENTITIES_CHANGE_TYPE } from '../graphql/structureEntityMutations';
import { useStructureFeedback } from './useStructureFeedback';
import { useStructureMembershipSync } from './useStructureMembershipSync';

const STRUCTURE_TYPE_CHANGE_REFETCH = [
  'StructureEntityDetail',
  'StructureEntityTypesList',
  'StructureEntitiesSelect',
  'StructureEntityDetailSelect',
];

export const useStructureTypeChange = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const syncMembership = useStructureMembershipSync();
  const { success, failure } = useStructureFeedback();
  const [changeType, { loading }] = useMutation<
    { structureEntitiesChangeType: { _id: string; typeId: string } },
    { _id: string; typeId: string }
  >(STRUCTURE_ENTITIES_CHANGE_TYPE, {
    refetchQueries: STRUCTURE_TYPE_CHANGE_REFETCH,
    awaitRefetchQueries: true,
  });

  const change = async (
    entity: { _id: string; title: string },
    type: { _id: string; name: string },
  ) => {
    try {
      await changeType({ variables: { _id: entity._id, typeId: type._id } });
      await syncMembership([entity._id]);
      success(t('type-changed', { title: entity.title, type: type.name }));

      return true;
    } catch (error) {
      failure(error);

      return false;
    }
  };

  return { change, changing: loading };
};
