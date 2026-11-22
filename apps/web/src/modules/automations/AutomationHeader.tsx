import { paths } from '~/lib/paths';
import type { Automation } from '@erxes/core-contract';
import {
  IconAdjustmentsHorizontal,
  IconBolt,
  IconDeviceFloppy,
  IconDots,
  IconFlask,
  IconHistory,
  IconTrash,
} from '@tabler/icons-react';
import {
  Button,
  DropdownMenu,
  Input,
  PageHeader,
  Switch,
  useConfirm,
  AppBreadcrumb,
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
      <label
        className="flex items-center gap-2 text-sm"
        title={blocked ? t('fix-first', 'Fix the marked steps first') : undefined}
      >
        <Switch
          checked={isOn}
          disabled={activate.isPending || pause.isPending || blocked}
          aria-label={isOn ? t('turn-off', 'Turn off') : t('activate', 'Turn on')}
          onCheckedChange={(next) => (next ? activate.mutate(draft.input) : pause.mutate(id))}
        />
        {isOn ? t('switch-on', 'On') : t('switch-off', 'Off')}
      </label>
      <Button variant="outline" onClick={onTest}>
        <IconFlask />
        {t('test', 'Test')}
      </Button>
      <Button
        disabled={save.isPending || !draft.dirty}
        onClick={() => save.mutate(draft.input)}
        title={isOn ? t('save-live', 'Changes apply at once while it is on') : '⌘S'}
      >
        <IconDeviceFloppy />
        {t('save', 'Save')}
      </Button>
      <MoreMenu automation={automation} remove={remove} onSettings={onSettings} />
    </PageHeader.End>
  );
};

const MoreMenu = ({
  automation,
  remove,
  onSettings,
}: {
  automation: Automation;
  remove: AutomationMutations['remove'];
  onSettings: () => void;
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

/** Breadcrumb, status and unsaved marker; for editors, the save and lifecycle actions. */
export const AutomationHeader = ({
  editable,
  ...props
}: Parameters<typeof EditorActions>[0] & { editable: boolean }) => {
  const { t } = useTranslation('automations');
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
        {draft.dirty && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-warning" />
            {t('unsaved', 'Unsaved changes')}
          </span>
        )}
      </PageHeader.Start>
      {editable && <EditorActions {...props} />}
    </PageHeader>
  );
};
