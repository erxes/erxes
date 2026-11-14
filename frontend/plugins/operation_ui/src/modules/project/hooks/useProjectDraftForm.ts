import { useDescriptionEditor } from '@/operation/hooks/useDescriptionEditor';
import { useGetCurrentUsersTeams } from '@/team/hooks/useGetCurrentUsersTeams';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSidePanelDraft } from 'ui-modules';
import { PROJECT_CONTENT_TYPE } from '../constants/contentType';
import {
  getProjectDraft,
  projectDraftSchema,
  TProjectDraft,
} from '../utils/projectDraft';
import { useCreateProjectRecord } from './useCreateProjectRecord';

export const useProjectDraftForm = () => {
  const { t } = useTranslation('operation');
  const draft = useSidePanelDraft<TProjectDraft>(PROJECT_CONTENT_TYPE);
  const { teams, loading: loadingTeams } = useGetCurrentUsersTeams({
    skip: draft.teamIds !== undefined,
  });
  const firstTeamId = teams?.[0]?._id;
  const form = useForm<TProjectDraft>({
    resolver: zodResolver(projectDraftSchema),
    defaultValues: getProjectDraft(draft, undefined, firstTeamId),
  });
  const { editor, isReady } = useDescriptionEditor(
    draft.description,
    t('description-command-placeholder', 'Type "/" for commands...'),
  );
  const { createProjectRecord, loading } = useCreateProjectRecord();

  useEffect(() => {
    if (
      draft.teamIds === undefined &&
      firstTeamId &&
      !form.getFieldState('teamIds').isDirty
    ) {
      form.setValue('teamIds', [firstTeamId]);
    }
  }, [draft.teamIds, firstTeamId, form]);

  const ready = isReady && (draft.teamIds !== undefined || !loadingTeams);
  const onSubmit = form.handleSubmit((values) => {
    if (!ready) return;
    
    return createProjectRecord({
      ...values,
      description: JSON.stringify(editor.document),
    });
  });

  return { form, editor, ready, loading, onSubmit };
};
