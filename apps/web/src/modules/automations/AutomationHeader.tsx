import { paths } from '~/lib/paths';
import type { Automation } from '@erxes/core-contract';
import {
  IconAdjustmentsHorizontal,
  IconBolt,
  IconDeviceFloppy,
  IconDots,
  IconFlask,
  IconHistory,
  IconPlayerPause,
  IconPlayerPlay,
  IconTrash,
} from '@tabler/icons-react';
import {
  AppBreadcrumb,
  Badge,
  Button,
  DropdownMenu,
  Input,
  PageHeader,
  useConfirm,
  useFormat,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AutomationMutations, useAutomationDraft } from './useAutomationEditor';
import { VersionsPanel } from './VersionsPanel';

const EditorActions = ({
  automation,
  draft,
  mutations,
  problemCount,
  onTest,
  onSettings,
}: {
  automation: Automation;
  draft: ReturnType<typeof useAutomationDraft>;
  mutations: AutomationMutations;
  problemCount: number;
  onTest: () => void;
  onSettings: () => void;
}) => {
  const { t } = useTranslation('automations');
  const { save, activate, pause, remove } = mutations;
  const id = { id: automation.id };
  const isOn = automation.status === 'active';
  const blocked = !isOn && problemCount > 0;

  return (
    <PageHeader.End>
      {isOn && (
        <Badge variant="success" size="lg">
          <span className="size-1.5 animate-pulse rounded-full bg-success" />
          {t('live', 'Live')}
        </Badge>
      )}
      <Button variant="outline" onClick={onTest}>
        <IconFlask />
        {t('test', 'Test')}
      </Button>
      <Button
        variant={isOn ? 'default' : 'outline'}
        disabled={save.isPending || !draft.dirty}
        onClick={() => save.mutate(draft.input)}
        title={isOn ? t('save-live', 'Changes apply at once while it is on') : '⌘S'}
      >
        <IconDeviceFloppy />
        {t('save', 'Save')}
      </Button>
      {!isOn && (
        <span title={blocked ? t('fix-first', 'Fix the marked steps first') : undefined}>
          <Button
            disabled={activate.isPending || blocked}
            onClick={() => activate.mutate(draft.input)}
          >
            <IconPlayerPlay />
            {t('activate', 'Turn on')}
          </Button>
        </span>
      )}
      <MoreMenu
        automation={automation}
        remove={remove}
        onSettings={onSettings}
        onPause={isOn && !pause.isPending ? () => pause.mutate(id) : undefined}
      />
    </PageHeader.End>
  );
};

const MoreMenu = ({
  automation,
  remove,
  onSettings,
  onPause,
}: {
  automation: Automation;
  remove: AutomationMutations['remove'];
  onSettings: () => void;
  /** While it is on: stop new runs. */
  onPause?: () => void;
}) => {
  const { t } = useTranslation('automations');
  const { confirm } = useConfirm();
  const [versionsOpen, setVersionsOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenu.Trigger
          aria-label={t('more-actions', 'More')}
          render={<Button variant="ghost" size="icon" />}
        >
          <IconDots />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end" className="w-52">
          {onPause && (
            <>
              <DropdownMenu.Item onClick={onPause}>
                <IconPlayerPause />
                {t('pause', 'Pause')}
              </DropdownMenu.Item>
              <DropdownMenu.Separator />
            </>
          )}
          <DropdownMenu.Item onClick={onSettings}>
            <IconAdjustmentsHorizontal />
            {t('settings', 'Settings')}
          </DropdownMenu.Item>
          <DropdownMenu.Item onClick={() => setVersionsOpen(true)}>
            <IconHistory />
            {t('versions', 'Earlier versions')}
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item
            disabled={remove.isPending}
            onClick={() =>
              void confirm({
                message: t('delete-confirm', 'Delete “{{name}}”? Runs in progress stop.', {
                  name: automation.name,
                }),
              }).then(() => remove.mutate({ id: automation.id }))
            }
          >
            <IconTrash />
            {t('delete', 'Delete')}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
      <VersionsPanel
        automationId={automation.id}
        active={automation.activeVersion}
        open={versionsOpen}
        onOpenChange={setVersionsOpen}
      />
    </>
  );
};

type Draft = Parameters<typeof EditorActions>[0]['draft'];

/** "Unsaved changes", kept in this browser until saved, with a way to throw them away. */
const UnsavedMarker = ({ draft }: { draft: Draft }) => {
  const { t } = useTranslation('automations');
  const { confirm } = useConfirm();

  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className="size-1.5 rounded-full bg-warning" />
      {t('unsaved', 'Unsaved changes')}
      <Button
        variant="ghost"
        size="sm"
        tone="muted"
        onClick={() =>
          void confirm({
            message: t('discard-confirm', 'Discard your unsaved changes?'),
            options: {
              description: t('discard-description', 'The automation goes back to its last save.'),
              okLabel: t('discard', 'Discard'),
              variants: { ok: 'destructive' },
            },
          }).then(draft.drop)
        }
      >
        {t('discard', 'Discard')}
      </Button>
    </span>
  );
};

/** Edits kept from before someone else saved: put them back over the new version, or drop them. */
const StaleDraft = ({ draft }: { draft: Draft }) => {
  const { t } = useTranslation('automations');

  return (
    <span className="flex items-center gap-1 text-xs text-warning-text">
      {t('stale-draft', 'Your unsaved changes were made before the last save.')}
      <Button variant="ghost" size="sm" onClick={draft.restore}>
        {t('stale-restore', 'Put them back')}
      </Button>
      <Button variant="ghost" size="sm" tone="muted" onClick={draft.drop}>
        {t('stale-drop', 'Drop them')}
      </Button>
    </span>
  );
};

/** Breadcrumb, status and unsaved marker; for editors, the save and lifecycle actions. */
export const AutomationHeader = ({
  editable,
  ...props
}: Parameters<typeof EditorActions>[0] & { editable: boolean }) => {
  const { t } = useTranslation('automations');
  const { relative } = useFormat();
  const { draft } = props;

  return (
    <PageHeader>
      <PageHeader.Start>
        <AppBreadcrumb
          items={[{ label: t('title', 'Automations'), to: paths.automations.list, icon: IconBolt }]}
        />
        <Input
          variant="secondary"
          className="w-72"
          aria-label={t('name', 'Name')}
          value={draft.name}
          disabled={!editable}
          maxLength={120}
          onChange={(event) => draft.change({ name: event.target.value })}
        />
        {draft.dirty && editable ? (
          <UnsavedMarker draft={draft} />
        ) : (
          <span className="text-xs whitespace-nowrap text-muted-foreground">
            {t('saved-ago', 'Saved {{when}}', { when: relative(props.automation.updatedAt) })}
          </span>
        )}
        {draft.stale && editable && <StaleDraft draft={draft} />}
      </PageHeader.Start>
      {editable && <EditorActions {...props} />}
    </PageHeader>
  );
};
