import { useAiAgentDetailContext } from '@/automations/components/settings/components/agents/context/AiAgentDetailContext';
import { AUTOMATIONS_AI_AGENT_REINDEX } from '@/automations/components/settings/components/agents/graphql/automationsAiAgents';
import { getAiAgentFileMemoryKey } from '@/automations/components/settings/components/agents/hooks/useAiAgentMemoryItems';
import { TAiAgentForm } from '@/automations/components/settings/components/agents/states/AiAgentFormSchema';
import { formatBytes } from '@/automations/components/settings/components/agents/utils/contextFileUpload';
import { mapUploadedContextFiles } from '@/automations/components/settings/components/agents/utils/contextFiles';
import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useCallback, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export const AI_AGENT_UI_LIMITS = {
  maxFiles: 10,
  maxSingleFileBytes: 50_000,
  maxTotalContextBytes: 200_000,
} as const;

type TContextFiles = TAiAgentForm['context']['files'];

export const withUploadedFiles = (
  files: TContextFiles,
  uploaded: Parameters<typeof mapUploadedContextFiles>[0],
) => [...files, ...mapUploadedContextFiles(uploaded)];

export const withoutFile = (files: TContextFiles, fileId: string) =>
  files.filter(({ id }) => id !== fileId);

/**
 * The agent's context files: the limits shown above the dropzone, opening a
 * file in memory, and queueing one file for reindex once the agent is saved.
 */
export const useAiAgentContextFilesForm = () => {
  const { t } = useTranslation('automations');
  const { control } = useFormContext<TAiAgentForm>();
  const { detail, openMemory } = useAiAgentDetailContext();
  const id = detail?._id;
  const [reindexingFileId, setReindexingFileId] = useState<string | null>(null);
  const [reindex] = useMutation(AUTOMATIONS_AI_AGENT_REINDEX);

  const openFile = useCallback(
    (fileId: string) => openMemory(getAiAgentFileMemoryKey(fileId)),
    [openMemory],
  );

  const reindexFile = useCallback(
    async (fileId: string) => {
      setReindexingFileId(fileId);

      try {
        await reindex({ variables: { id, fileId } });
        toast({
          title: t('settings-context-files-reindex-queued'),
          description: t('settings-context-files-reindex-queued-description'),
          variant: 'success',
        });
      } catch (error) {
        toast({
          title: t('settings-context-files-reindex-failed'),
          description: (error as Error).message,
          variant: 'destructive',
        });
      } finally {
        setReindexingFileId(null);
      }
    },
    [reindex, id, t],
  );

  return {
    control,
    limitsText: t('settings-context-files-limits', {
      maxFiles: AI_AGENT_UI_LIMITS.maxFiles,
      single: formatBytes(AI_AGENT_UI_LIMITS.maxSingleFileBytes),
      total: formatBytes(AI_AGENT_UI_LIMITS.maxTotalContextBytes),
    }),
    reindexingFileId,
    // Reindex works on a stored agent only
    reindexFile: id ? reindexFile : undefined,
    openFile,
  };
};
