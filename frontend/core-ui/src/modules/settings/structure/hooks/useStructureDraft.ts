import { useAtom } from 'jotai';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useStructureWorkspace } from '../contexts/StructureWorkspaceContext';
import { structureDraftParentState } from '../states/structureViewState';
import { IStructureEntityAddVariables } from '../types/structureEntity';
import { toStructureNewTypeVariables } from '../utils/structureEntityTypeInput';
import {
  useStructureEntityMutations,
  useStructureEntityTypeMutations,
} from './useStructureEntityMutations';
import { useStructureFeedback } from './useStructureFeedback';

export const useStructureDraft = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const [draftParentId, setDraftParentId] = useAtom(structureDraftParentState);
  const { types } = useStructureWorkspace();
  const { addEntity, adding } = useStructureEntityMutations();
  const { addType, saving } = useStructureEntityTypeMutations();
  const { success, failure } = useStructureFeedback();

  const closeDraft = useCallback(
    () => setDraftParentId(null),
    [setDraftParentId],
  );

  const createChild = async (variables: IStructureEntityAddVariables) => {
    try {
      await addEntity({ variables });
      success(t('node-created', { title: variables.title }));

      return true;
    } catch (error) {
      failure(error);

      return false;
    }
  };

  const createType = async (name: string) => {
    try {
      const { data } = await addType({
        variables: toStructureNewTypeVariables(
          name,
          types.map(({ code }) => code),
        ),
      });

      success(t('type-created', { name: name.trim() }));

      return data?.structureEntityTypesAdd._id;
    } catch (error) {
      failure(error);

      return undefined;
    }
  };

  return {
    draftParentId,
    closeDraft,
    createChild,
    createType,
    busy: adding || saving,
  };
};
