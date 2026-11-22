import { paths } from '~/lib/paths';
import type { Automation } from '@erxes/core-contract';
import { IconBolt, IconDeviceFloppy, IconDots, IconHistory, IconTrash } from '@tabler/icons-react';
import { Button, DropdownMenu, Input, PageHeader, Switch, useConfirm } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { TestPanel } from './TestPanel';
import type { AutomationMutations, useAutomationDraft } from './useAutomationEditor';
import { VersionsPanel } from './VersionsPanel';

const EditorActions = ({
  automation,
  draft,
  mutations,
  subject,
  problemCount,
}: {
  automation: Automation;
  draft: ReturnType<typeof useAutomationDraft>;
  mutations: AutomationMutations;
  subject: 'customer' | 'company' | null;
  problemCount: number;
}) => {
  const { t } = useTranslation('automations');
  const { confirm } = useConfirm();
  const { save, activate, pause, remove } = mutations;
  const [versionsOpen, setVersionsOpen] = useState(false);
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
      <TestPanel automation={automation} subject={subject} />
      <Button
        disabled={save.isPending || !draft.dirty}
        onClick={() => save.mutate(draft.input)}
        title={isOn ? t('save-live', 'Changes apply at once while it is on') : '⌘S'}
      >
        <IconDeviceFloppy />
        {t('save', 'Save')}
      </Button>
      <DropdownMenu>
        <DropdownMenu.Trigger
          aria-label={t('more-actions', 'More')}
          render={<Button variant="ghost" size="icon" />}
        >
          <IconDots />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end" className="w-52">
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
              }).then(() => remove.mutate(id))
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
    </PageHeader.End>
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
