import {
  AutomationNodeHistoryProvider,
  useAutomationNodeHistoryContext,
} from '@/automations/components/builder/sidebar/context/AutomationNodeHistoryContext';
import {
  TNodeHistoryMode,
  TValueView,
} from '@/automations/components/builder/sidebar/hooks/useAutomationNodeHistory';
import { TAutomationVersion } from '@/automations/types';
import { TChangeKind } from '@/automations/utils/automationVersions';
import {
  IconArrowBackUp,
  IconArrowRight,
  IconChevronLeft,
  IconChevronRight,
  IconMinus,
  IconPencil,
  IconPlus,
  TablerIcon,
} from '@tabler/icons-react';
import {
  Badge,
  Button,
  cn,
  Dialog,
  IconComponent,
  RelativeDateDisplay,
  Skeleton,
  Spinner,
  ToggleGroup,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';

const CHANGE_CHIP: Record<
  TChangeKind,
  { className: string; icon: TablerIcon }
> = {
  changed: { className: 'bg-warning/10 text-warning', icon: IconPencil },
  set: { className: 'bg-success/10 text-success', icon: IconPlus },
  cleared: { className: 'bg-destructive/10 text-destructive', icon: IconMinus },
};

const ValueCell = ({
  value,
  tone,
}: {
  value: TValueView;
  tone: 'before' | 'after';
}) => {
  if (value.isEmpty) {
    return <span className="text-xs text-muted-foreground">{value.text}</span>;
  }

  return (
    <span
      className={cn(
        'break-all rounded px-1.5 py-0.5',
        value.isExpression && 'border font-mono text-xs',
        tone === 'before'
          ? 'text-muted-foreground line-through decoration-muted-foreground/50'
          : 'bg-success/10',
      )}
    >
      {value.text}
    </span>
  );
};

const VersionComparison = () => {
  const { loadingChanges, rows, emptyMessage } =
    useAutomationNodeHistoryContext();

  if (loadingChanges) {
    return <Skeleton className="mx-6 h-32" />;
  }

  if (emptyMessage) {
    return (
      <p className="px-6 py-6 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul>
      {rows.map(({ key, label, before, after }) => (
        <li
          key={key}
          className="grid grid-cols-[9rem_1fr_1rem_1fr] items-center gap-3 border-t px-6 py-3 text-sm"
        >
          <span className="text-xs text-muted-foreground">{label}</span>
          <ValueCell value={before} tone="before" />
          <IconArrowRight className="size-4 text-muted-foreground" />
          <ValueCell value={after} tone="after" />
        </li>
      ))}
    </ul>
  );
};

const VersionDialogHeader = () => {
  const {
    stepLabel,
    stepIcon,
    savedByLabel,
    savedAt,
    openVersionNumber,
    positionLabel,
    canGoOlder,
    canGoNewer,
    goOlder,
    goNewer,
  } = useAutomationNodeHistoryContext();

  return (
    <div className="flex items-center gap-3 px-6 pt-6">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <IconComponent name={stepIcon || 'IconHistory'} className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <Dialog.Title className="truncate text-base">{stepLabel}</Dialog.Title>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          {savedByLabel}
          {savedAt && (
            <RelativeDateDisplay value={savedAt} asChild>
              <span>
                · <RelativeDateDisplay.Value value={savedAt} />
              </span>
            </RelativeDateDisplay>
          )}
        </p>
      </div>
      <div className="mr-8 flex shrink-0 items-center gap-1">
        {/* Older to the left, like reading back through time */}
        <Button
          variant="outline"
          size="icon"
          className="size-7"
          disabled={!canGoOlder}
          onClick={goOlder}
        >
          <IconChevronLeft className="size-4" />
        </Button>
        <div className="px-2 text-center leading-tight">
          <p className="text-sm font-medium">v{openVersionNumber}</p>
          <p className="text-[10px] text-muted-foreground">{positionLabel}</p>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="size-7"
          disabled={!canGoNewer}
          onClick={goNewer}
        >
          <IconChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
};

const VersionDialog = () => {
  const { t } = useTranslation('automations');
  const {
    isDialogOpen,
    closeVersionDialog,
    mode,
    setMode,
    summary,
    openVersionNumber,
    canRestore,
    restore,
  } = useAutomationNodeHistoryContext();

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => !open && closeVersionDialog()}
    >
      <Dialog.Content className="max-w-3xl gap-0 overflow-hidden p-0">
        <VersionDialogHeader />
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
          <ToggleGroup
            type="single"
            variant="outline"
            value={mode}
            onValueChange={(value) =>
              value && setMode(value as TNodeHistoryMode)
            }
          >
            <ToggleGroup.Item value="restore" size="sm">
              {t('versions-mode-restore')}
            </ToggleGroup.Item>
            <ToggleGroup.Item value="save" size="sm">
              {t('versions-mode-save')}
            </ToggleGroup.Item>
          </ToggleGroup>
          <div className="flex flex-wrap gap-1.5">
            {summary.map(({ kind, label }) => {
              const { className, icon: Icon } = CHANGE_CHIP[kind];

              return (
                <span
                  key={kind}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs',
                    className,
                  )}
                >
                  <Icon className="size-3" />
                  {label}
                </span>
              );
            })}
          </div>
        </div>
        <div className="max-h-[50vh] overflow-y-auto">
          <VersionComparison />
        </div>
        <div className="flex items-center justify-between gap-3 border-t bg-muted/40 px-6 py-3">
          <span className="text-xs text-muted-foreground">
            {t('versions-restore-hint')}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={closeVersionDialog}>
              {t('versions-close')}
            </Button>
            {canRestore && (
              <Button onClick={restore}>
                <IconArrowBackUp />
                {t('versions-restore-version', { version: openVersionNumber })}
              </Button>
            )}
          </div>
        </div>
      </Dialog.Content>
    </Dialog>
  );
};

const VersionRow = ({
  version,
  isLatest,
  onOpen,
}: {
  version: TAutomationVersion;
  isLatest: boolean;
  onOpen: () => void;
}) => {
  const { t } = useTranslation('automations');
  const userName =
    version.createdUser?.details?.fullName || version.createdUser?.email;

  return (
    <li className="border-b last:border-b-0">
      <button
        type="button"
        onClick={onOpen}
        className="group flex w-full items-center gap-2 px-5 py-3 text-left text-sm hover:bg-muted/50"
      >
        <span className="font-medium">v{version.version}</span>
        {isLatest && <Badge variant="secondary">{t('versions-saved')}</Badge>}
        <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
          {userName}
        </span>
        {version.createdAt && (
          <RelativeDateDisplay value={version.createdAt} asChild>
            <span className="shrink-0 text-xs text-muted-foreground">
              <RelativeDateDisplay.Value value={version.createdAt} />
            </span>
          </RelativeDateDisplay>
        )}
        <IconChevronRight className="size-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100" />
      </button>
    </li>
  );
};

const AutomationNodeHistoryList = () => {
  const { t } = useTranslation('automations');
  const { isSaved, loading, nodeVersions, latestVersion, openVersionDialog } =
    useAutomationNodeHistoryContext();

  if (!isSaved) {
    return (
      <p className="px-5 py-4 text-sm text-muted-foreground">
        {t('versions-save-first')}
      </p>
    );
  }

  if (loading) {
    return <Spinner className="py-6" />;
  }

  if (!nodeVersions.length) {
    return (
      <p className="px-5 py-4 text-sm text-muted-foreground">
        {t('versions-node-empty')}
      </p>
    );
  }

  return (
    <ul>
      {nodeVersions.map((version) => (
        <VersionRow
          key={version._id}
          version={version}
          isLatest={version.version === latestVersion}
          onOpen={() => openVersionDialog(version._id)}
        />
      ))}
    </ul>
  );
};

/** The saved versions the selected step changed in; one opens to compare. */
export const AutomationBuilderNodeHistory = () => (
  <AutomationNodeHistoryProvider>
    <AutomationNodeHistoryList />
    <VersionDialog />
  </AutomationNodeHistoryProvider>
);
