import { TAiAgentForm } from '@/automations/components/settings/components/agents/states/AiAgentFormSchema';
import {
  getNextContextFilesAfterEdit,
  TAiAgentContextFile,
} from '@/automations/components/settings/components/agents/utils/contextFiles';
import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';

/** Saving an edited context file back into the agent form, in place. */
export const useAiAgentFileEditor = () => {
  const { getValues, setValue } = useFormContext<TAiAgentForm>();

  const saveFile = useCallback(
    (nextFile: TAiAgentContextFile) => {
      const files = getNextContextFilesAfterEdit({
        files: getValues('context.files'),
        fileId: nextFile.id,
        uploadedFile: nextFile,
      }).map((current) => ({ ...current, versions: current.versions || [] }));

      setValue('context.files', files, { shouldDirty: true });
    },
    [getValues, setValue],
  );

  return { saveFile };
};
