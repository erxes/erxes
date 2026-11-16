import { useAutomation } from '@/automations/context/AutomationProvider';
import {
  AUTOMATION_VERSION_DETAIL,
  AUTOMATION_VERSIONS,
} from '@/automations/graphql/automationVersions';
import { automationNodeRestoreKeyState } from '@/automations/states/automationVersionState';
import {
  AutomationNodesType,
  TAutomationVersion,
  TAutomationVersionDetail,
} from '@/automations/types';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { useApolloClient, useQuery } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useCallback } from 'react';
import { FieldPath, PathValue, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const DIRTY = { shouldDirty: true, shouldValidate: true };

/** The saved automation's kept versions, newest first. */
export const useAutomationVersions = () => {
  const { detail } = useAutomation();
  const automationId = detail?._id;
  const { data, loading, error } = useQuery<{
    automationVersions: TAutomationVersion[];
  }>(AUTOMATION_VERSIONS, {
    variables: { automationId },
    skip: !automationId,
  });
  const versions = data?.automationVersions || [];

  return {
    isSaved: !!automationId,
    versions,
    latestVersion: versions[0]?.version,
    loading,
    error,
  };
};

/** One version's flow, loaded only once it is asked for. */
export const useAutomationVersionDetail = (versionId?: string) => {
  const { data, loading } = useQuery<{
    automationVersionDetail: TAutomationVersionDetail;
  }>(AUTOMATION_VERSION_DETAIL, {
    variables: { _id: versionId },
    skip: !versionId,
  });

  return { detail: data?.automationVersionDetail, loading };
};

type TFlowPath = FieldPath<TAutomationBuilderForm>;

/**
 * Restoring writes into the builder only: nothing is saved until the
 * builder's Save, which then keeps it as a new version.
 */
export const useAutomationVersionRestore = () => {
  const { t } = useTranslation('automations');
  const client = useApolloClient();
  const { getValues, setValue } = useFormContext<TAutomationBuilderForm>();
  const bumpRestoreKey = useSetAtom(automationNodeRestoreKeyState);

  const set = useCallback(
    (path: TFlowPath, value: unknown) =>
      setValue(
        path,
        value as PathValue<TAutomationBuilderForm, TFlowPath>,
        DIRTY,
      ),
    [setValue],
  );

  const announce = useCallback(
    (version: number) => {
      bumpRestoreKey((key) => key + 1);
      toast({
        title: t('versions-restored', { version }),
        description: t('versions-restored-description'),
      });
    },
    [bumpRestoreKey, t],
  );

  /** Puts one node's config back as it was in a version. */
  const restoreNodeConfig = useCallback(
    (nodeId: string, config: Record<string, unknown>, version: number) => {
      const nodeTypes = [
        AutomationNodesType.Triggers,
        AutomationNodesType.Actions,
      ] as const;

      for (const nodeType of nodeTypes) {
        const index = (getValues(nodeType) || []).findIndex(
          ({ id }) => id === nodeId,
        );

        if (index !== -1) {
          set(`${nodeType}.${index}.config` as TFlowPath, config);
          announce(version);
          return;
        }
      }
    },
    [getValues, set, announce],
  );

  /** Replaces the whole flow with a version's. */
  const restoreFlow = useCallback(
    async (versionId: string) => {
      try {
        const { data } = await client.query<{
          automationVersionDetail: TAutomationVersionDetail;
        }>({ query: AUTOMATION_VERSION_DETAIL, variables: { _id: versionId } });
        const detail = data.automationVersionDetail;

        set(AutomationNodesType.Triggers, detail.triggers);
        set(AutomationNodesType.Actions, detail.actions);
        set(AutomationNodesType.Workflows, detail.workflows);
        announce(detail.version);
      } catch (error) {
        toast({
          title: t('versions-restore-failed'),
          description: (error as Error).message,
          variant: 'destructive',
        });
      }
    },
    [client, set, announce, t],
  );

  return { restoreNodeConfig, restoreFlow };
};
