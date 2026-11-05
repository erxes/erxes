import { useCallback, useEffect } from 'react';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useIntegrationAdd } from './useIntegrationAdd';
import {
  createIntegrationDraftState,
  useIntegrationDraftSession,
} from './useIntegrationDraft';

type CreateOptions = NonNullable<
  Parameters<ReturnType<typeof useIntegrationAdd>['addIntegration']>[0]
>;
type Creation = { request: symbol | null; createdId: string | null };
const useCreation = createIntegrationDraftState<Creation>({
  request: null,
  createdId: null,
});

export const useSocialIntegrationCreate = (): {
  createIntegration: (options: CreateOptions) => Promise<void>;
  createdId: string | null;
  loading: boolean;
} => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  const { addIntegration, loading } = useIntegrationAdd();
  const [creation, , updateCreation] = useCreation();
  const { clearSession } = useIntegrationDraftSession();

  useEffect(
    () => () => {
      let completed = false;
      updateCreation((current) => {
        completed = Boolean(current.createdId);
        return current;
      });
      if (completed) clearSession();
    },
    [updateCreation, clearSession],
  );

  const createIntegration = useCallback(
    async (options: CreateOptions): Promise<void> => {
      const request = Symbol('social-integration-create');
      let started = false;
      updateCreation((current) => {
        if (current.request || current.createdId) return current;
        started = true;
        return { request, createdId: null };
      });
      if (!started) return;

      try {
        const result = await addIntegration(options);
        const createdId =
          result.data?.integrationsCreateExternalIntegration?._id;
        if (!createdId) throw new Error(t('failed-to-add-integration'));
        updateCreation((current) =>
          current.request === request ? { request: null, createdId } : current,
        );
      } catch (error: unknown) {
        toast({
          title: t('failed-to-add-integration'),
          description: error instanceof Error ? error.message : undefined,
          variant: 'destructive',
        });
      } finally {
        updateCreation((current) =>
          current.request === request ? { ...current, request: null } : current,
        );
      }
    },
    [addIntegration, updateCreation, t],
  );

  return {
    createIntegration,
    createdId: creation.createdId,
    loading: loading || Boolean(creation.request),
  };
};
