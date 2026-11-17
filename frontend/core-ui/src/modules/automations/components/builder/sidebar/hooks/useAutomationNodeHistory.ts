import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import {
  useAutomationVersionDetail,
  useAutomationVersionRestore,
  useAutomationVersions,
} from '@/automations/hooks/useAutomationVersions';
import { useValuePreviewText } from '@/automations/hooks/useValuePreviewText';
import {
  changeKindOf,
  configChangesOf,
  isExpressionPreview,
  nodeInVersion,
  previousVersionOf,
  TChangeKind,
  TConfigChange,
  TValuePreview,
  versionsOfNode,
} from '@/automations/utils/automationVersions';
import { useTranslation } from 'react-i18next';
import { useCallback, useState } from 'react';

// What the opened version is compared with: the builder now, or the save before
export type TNodeHistoryMode = 'restore' | 'save';

export type TValueView = {
  text: string;
  isEmpty: boolean;
  isExpression: boolean;
};

export type TChangeRow = {
  key: string;
  label: string;
  kind: TChangeKind;
  before: TValueView;
  after: TValueView;
};

const CHANGE_KINDS: TChangeKind[] = ['changed', 'set', 'cleared'];

/**
 * The selected step's history. Opening a version shows first what restoring
 * it would change in the builder, and also what that save itself changed.
 */
export const useAutomationNodeHistory = () => {
  const { queryParams, isReadOnly } = useAutomation();
  const nodeId = queryParams?.activeNodeId || '';
  const { triggers, actions, workflows } = useAutomationNodes();
  const { isSaved, versions, latestVersion, loading } = useAutomationVersions();
  const [openVersionId, setOpenVersionId] = useState<string>();
  const [mode, setMode] = useState<TNodeHistoryMode>('restore');
  const { restoreNodeConfig } = useAutomationVersionRestore();
  const textOf = useValuePreviewText();
  const { t } = useTranslation('automations');

  const nodeVersions = versionsOfNode(versions, nodeId);
  const openVersion = nodeVersions.find(({ _id }) => _id === openVersionId);
  const previous = openVersion
    ? previousVersionOf(versions, openVersion.version)
    : undefined;
  const { detail: openDetail, loading: loadingOpen } =
    useAutomationVersionDetail(openVersion?._id);
  const { detail: previousDetail, loading: loadingPrevious } =
    useAutomationVersionDetail(previous?._id);

  const openNode = nodeInVersion(openDetail, nodeId);
  const currentNode = nodeInVersion({ triggers, actions, workflows }, nodeId);

  const viewOf = (preview: TValuePreview): TValueView => ({
    text: preview.kind === 'empty' ? t('versions-not-set') : textOf(preview),
    isEmpty: preview.kind === 'empty',
    isExpression: isExpressionPreview(preview),
  });

  const toRows = (changes: TConfigChange[]): TChangeRow[] =>
    changes.map((change) => ({
      key: change.key,
      label: change.label,
      kind: changeKindOf(change),
      before: viewOf(change.before),
      after: viewOf(change.after),
    }));

  const restoreChanges = toRows(configChangesOf(currentNode, openNode));
  const saveChanges = toRows(
    configChangesOf(nodeInVersion(previousDetail, nodeId), openNode),
  );

  const openVersionDialog = useCallback((versionId: string) => {
    setMode('restore');
    setOpenVersionId(versionId);
  }, []);
  const closeVersionDialog = useCallback(() => setOpenVersionId(undefined), []);

  const restore = useCallback(() => {
    if (openNode && openVersion) {
      restoreNodeConfig(nodeId, openNode.config || {}, openVersion.version);
      setOpenVersionId(undefined);
    }
  }, [openNode, openVersion, nodeId, restoreNodeConfig]);

  const stepNode = currentNode || openNode;
  const rows = mode === 'restore' ? restoreChanges : saveChanges;

  // Newest first, so "older" moves down the list
  const position = nodeVersions.findIndex(({ _id }) => _id === openVersionId);
  const goTo = useCallback(
    (index: number) => {
      const target = nodeVersions[index];

      if (target) {
        setOpenVersionId(target._id);
      }
    },
    [nodeVersions],
  );

  // Why there is no comparison to show, when there is none
  const emptyMessageOf = () => {
    if (openDetail && !openNode) {
      return t('versions-node-removed');
    }

    if (mode === 'save' && openVersion && !previous) {
      return t('versions-first-kept');
    }

    if (rows.length) {
      return '';
    }

    return mode === 'restore'
      ? t('versions-same-as-now')
      : t('versions-meta-only');
  };

  const summary = CHANGE_KINDS.map((kind) => ({
    kind,
    count: rows.filter((row) => row.kind === kind).length,
  }))
    .filter(({ count }) => count > 0)
    .map(({ kind, count }) => ({
      kind,
      label: t(`versions-summary-${kind}`, { count }),
    }));
  const savedBy =
    openVersion?.createdUser?.details?.fullName ||
    openVersion?.createdUser?.email ||
    '';

  return {
    isSaved,
    loading,
    nodeVersions,
    latestVersion,
    isDialogOpen: !!openVersion,
    openVersionNumber: openVersion?.version,
    openVersionDialog,
    closeVersionDialog,
    stepLabel: stepNode?.label || stepNode?.type || '',
    stepIcon: stepNode?.icon,
    savedByLabel: savedBy ? t('versions-saved-by', { name: savedBy }) : '',
    positionLabel: t('versions-position', {
      position: nodeVersions.length - position,
      count: nodeVersions.length,
    }),
    canGoOlder: position >= 0 && position < nodeVersions.length - 1,
    canGoNewer: position > 0,
    goOlder: () => goTo(position + 1),
    goNewer: () => goTo(position - 1),
    summary,
    savedAt: openVersion?.createdAt,
    mode,
    setMode,
    loadingChanges: loadingOpen || (mode === 'save' && loadingPrevious),
    rows,
    // The two sides of the comparison, and what it says when they match
    emptyMessage: emptyMessageOf(),
    canRestore: !isReadOnly && !!openNode && restoreChanges.length > 0,
    restore,
  };
};
