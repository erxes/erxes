import { useTranslation } from 'react-i18next';
import { useStructureAccessMutations } from '@/structure-access';
import { TStructureTreeEntity } from '../types/structureEntity';
import {
  IStructureDragPerson,
  runStructurePersonDrop,
  TStructurePersonDropPlan,
} from '../utils/structureDrop';
import { useStructureFeedback } from './useStructureFeedback';
import { useStructureMembershipSync } from './useStructureMembershipSync';

export const useStructurePersonDrop = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { addMember, endMember } = useStructureAccessMutations();
  const syncMembership = useStructureMembershipSync();
  const { success, failure } = useStructureFeedback();

  return async (
    plan: TStructurePersonDropPlan,
    person: IStructureDragPerson,
    target: Pick<TStructureTreeEntity, '_id' | 'title'>,
  ) => {
    try {
      await runStructurePersonDrop(plan, {
        addMember: (variables) => addMember({ variables, refetchQueries: [] }),
        endMember: (memberId) =>
          endMember({
            variables: { _id: memberId },
            refetchQueries: ['StructureAccessSeats'],
          }),
      });
      success(
        t(plan.kind === 'move' ? 'person-moved' : 'person-added', {
          name: person.name,
          title: target.title,
        }),
      );
    } catch (error) {
      failure(error);
    } finally {
      await syncMembership(
        [target._id, person.membership?.entityId ?? ''].filter(Boolean),
      );
    }
  };
};
