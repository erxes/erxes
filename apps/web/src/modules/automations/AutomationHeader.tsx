import { paths } from '~/lib/paths';
import type { Automation } from '@erxes/core-contract';
import {
  IconBolt,
  IconDeviceFloppy,
  IconPlayerPause,
  IconPlayerPlay,
  IconTrash,
} from '@tabler/icons-react';
import { Badge, Button, PageHeader, useConfirm } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { TestPanel } from './TestPanel';
import type { AutomationMutations, useAutomationDraft } from './useAutomationEditor';
import { VersionsPanel } from './VersionsPanel';

const STATUS_BADGE = { active: 'success', paused: 'warning', draft: 'secondary' } as const;

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
  const id = { id: automation.id };

  return (
    <PageHeader.End>
      <VersionsPanel automationId={automation.id} active={automation.activeVersion} />
      <TestPanel automationId={automation.id} subject={subject} />
      <Button
        variant="ghost"
        aria-label={t('delete', 'Delete')}
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
      </Button>
      <Button
        variant="outline"
        disabled={save.isPending || !draft.dirty}
        onClick={() => save.mutate(draft.input)}
        title="⌘S"
      >
        <IconDeviceFloppy />
        {automation.status === 'active' ? t('publish', 'Save and publish') : t('save', 'Save')}
      </Button>
      {automation.status === 'active' ? (
        <Button variant="outline" disabled={pause.isPending} onClick={() => pause.mutate(id)}>
          <IconPlayerPause />
          {t('pause', 'Pause')}
        </Button>
      ) : (
        <Button
          disabled={activate.isPending || problemCount > 0}
          title={problemCount ? t('fix-first', 'Fix the marked steps first') : undefined}
          onClick={() => activate.mutate(draft.input)}
        >
          <IconPlayerPlay />
          {t('activate', 'Turn on')}
        </Button>
      )}
    </PageHeader.End>
  );
};

/** Breadcrumb, status and unsaved marker; for editors, the save and lifecycle actions. */
export const AutomationHeader = ({
  editable,
  ...props
}: Parameters<typeof EditorActions>[0] & { editable: boolean }) => {
  const { t } = useTranslation('automations');
  const { automation, draft } = props;

  return (
    <PageHeader>
      <PageHeader.Start>
        <AppBreadcrumb
          items={[
            { label: t('title', 'Automations'), to: paths.automations.list, icon: IconBolt },
            {
              label: draft.name || automation.name,
              to: paths.automations.automation(automation.id),
            },
          ]}
        />
        <Badge variant={STATUS_BADGE[automation.status]}>
          {t(`automation-status.${automation.status}`, automation.status)}
          {automation.activeVersion ? ` · v${automation.activeVersion}` : ''}
        </Badge>
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
