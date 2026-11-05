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
type CreateOperation = (created: (id: string) => void) => Promise<string>;
type Creation = { request: symbol | null; createdId: string | null };
const useCreation = createIntegrationDraftState<Creation>({
  request: null,
  createdId: null,
});

export const useSocialIntegrationCreate = (): {
  createIntegration: (options: CreateOptions) => Promise<void>;
  runCreate: (
    operation: CreateOperation,
    onError?: (error: unknown) => void,
  ) => Promise<void>;
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
        completed = Boolean(current.createdId && !current.request);
        return current;
      });
      if (completed) clearSession();
    },
    [updateCreation, clearSession],
  );

  const runCreate = useCallback(
    async (
      operation: CreateOperation,
      onError?: (error: unknown) => void,
    ): Promise<void> => {
      const request = Symbol('social-integration-create');
      let started = false;
      updateCreation((current) => {
        if (current.request || current.createdId) return current;
        started = true;
        return { request, createdId: null };
      });
      if (!started) return;

      try {
        const createdId = await operation((id) =>
          updateCreation((current) =>
            current.request === request
              ? { ...current, createdId: id }
              : current,
          ),
        );
        if (!createdId) throw new Error(t('failed-to-add-integration'));
        updateCreation((current) =>
          current.request === request ? { request: null, createdId } : current,
        );
      } catch (error: unknown) {
        if (onError) onError(error);
        else
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
    [updateCreation, t],
  );

  const createIntegration = (options: CreateOptions): Promise<void> =>
    runCreate(async () => {
      let failure: Error | undefined;
      const result = await addIntegration({
        ...options,
        onError: (error) => {
          failure = error;
        },
      });
      if (failure) throw failure;
      const id = result.data?.integrationsCreateExternalIntegration?._id;
      if (!id) throw new Error(t('failed-to-add-integration'));
      return id;
    });

  return {
    createIntegration,
    runCreate,
    createdId: creation.createdId,
    loading: loading || Boolean(creation.request),
  };
};
