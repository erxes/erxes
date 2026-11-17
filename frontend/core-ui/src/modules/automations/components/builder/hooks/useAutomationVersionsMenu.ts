import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import {
  useAutomationVersionDetail,
  useAutomationVersionRestore,
  useAutomationVersions,
} from '@/automations/hooks/useAutomationVersions';
import {
  restoreSummaryOf,
  TRestoreStatus,
} from '@/automations/utils/automationVersions';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

const STATUS_ORDER: TRestoreStatus[] = ['changed', 'added', 'removed', 'same'];

/**
 * The header's version list. Choosing one previews, step by step, what
 * restoring it would do to the flow in the builder before anything changes.
 */
export const useAutomationVersionsMenu = () => {
  const { t } = useTranslation('automations');
  const { isReadOnly } = useAutomation();
  const { triggers, actions, workflows } = useAutomationNodes();
  const { isSaved, versions, latestVersion, loading } = useAutomationVersions();
  const { restoreFlow } = useAutomationVersionRestore();
  const [open, setOpen] = useState(false);
  const [previewId, setPreviewId] = useState<string>();
  const { detail: previewDetail, loading: loadingPreview } =
    useAutomationVersionDetail(previewId);

  const rows = versions.map((version) => {
    const isLatest = version.version === latestVersion;

    return {
      version,
      isLatest,
      summary: `${t(`versions-note-${version.note || 'edited'}`)} · ${t(
        'versions-steps-changed',
        { count: version.changedNodeIds.length },
      )}`,
      canRestore: !isReadOnly,
    };
  });

  const steps = previewDetail
    ? restoreSummaryOf({ triggers, actions, workflows }, previewDetail).sort(
        (a, b) =>
          STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status),
      )
    : [];

  const statusLabelOf = (status: TRestoreStatus, changedFields: number) => {
    if (status === 'changed') {
      return changedFields
        ? t('versions-step-fields', { count: changedFields })
        : t('versions-step-links');
    }

    return t(`versions-step-${status}`);
  };

  const openPreview = useCallback((versionId: string) => {
    setOpen(false);
    setPreviewId(versionId);
  }, []);
  const closePreview = useCallback(() => setPreviewId(undefined), []);

  const confirmRestore = useCallback(async () => {
    if (previewId) {
      await restoreFlow(previewId);
      setPreviewId(undefined);
    }
  }, [previewId, restoreFlow]);

  return {
    isVisible: isSaved,
    open,
    setOpen,
    loading,
    isEmpty: !versions.length,
    rows,
    openPreview,
    preview: {
      isOpen: !!previewId,
      version: previewDetail?.version,
      loading: loadingPreview,
      steps: steps.map((step) => ({
        ...step,
        statusLabel: statusLabelOf(step.status, step.changedFields),
      })),
      hasChanges: steps.some(({ status }) => status !== 'same'),
      close: closePreview,
      confirm: confirmRestore,
    },
  };
};
