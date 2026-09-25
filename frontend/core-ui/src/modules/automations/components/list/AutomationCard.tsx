import { AutomationFlowStrip } from '@/automations/components/list/AutomationFlowStrip';
import {
  AutomationStatusBadge,
  AutomationStatusToggle,
  useAutomationStatusToggle,
} from '@/automations/components/list/AutomationStatusToggle';
import { useAutomationActions } from '@/automations/hooks/useAutomationActions';
import {
  automationExecutionCountAtomFamily,
  automationExecutionCountsLoadingState,
} from '@/automations/states/automationExecutionCountsState';
import { IAutomation } from '@/automations/types';
import { IconCopy, IconEdit, IconTrash } from '@tabler/icons-react';
import {
  Button,
  Card,
  DropdownMenu,
  Popover,
  PopoverScoped,
  RelativeDateDisplay,
  Skeleton,
} from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const AutomationCardRuns = ({ id }: { id: string }) => {
  const { t } = useTranslation('automations');
  const count = useAtomValue(automationExecutionCountAtomFamily(id));
  const loading = useAtomValue(automationExecutionCountsLoadingState);

  if (count === undefined) {
    return loading ? (
      <Skeleton className="h-3 w-10" />
    ) : (
      <span className="text-muted-foreground">—</span>
    );
  }

  return (
    <span className="tabular-nums">
      {count} {t('runs').toLowerCase()}
    </span>
  );
};

const AutomationCardMenu = ({ automation }: { automation: IAutomation }) => {
  const { t } = useTranslation('automations');
  const { canWrite, duplicating, removing, onEdit, onDuplicate, onRemove } =
    useAutomationActions(automation);

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild disabled={duplicating || removing}>
        <Button
          variant="ghost"
          size="icon"
          className="size-6 shrink-0"
          aria-label={t('actions')}
        >
          <span aria-hidden className="text-lg leading-none">
            &hellip;
          </span>
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        align="end"
        className="w-[140px] min-w-0 [&>button]:cursor-pointer"
      >
        <DropdownMenu.Item asChild onSelect={onEdit}>
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <IconEdit className="size-4" />
            {t('edit')}
          </Button>
        </DropdownMenu.Item>
        <DropdownMenu.Item asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            disabled={duplicating}
            onClick={onDuplicate}
          >
            <IconCopy className="size-4" />
            {t('duplicate')}
          </Button>
        </DropdownMenu.Item>
        <DropdownMenu.Item asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-destructive"
            disabled={!canWrite || removing}
            onClick={onRemove}
          >
            <IconTrash className="size-4" />
            {t('delete')}
          </Button>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

const AutomationCardStatus = ({
  id,
  status,
}: {
  id: string;
  status: string;
}) => {
  const [open, setOpen] = useState(false);
  const { setActive, loading } = useAutomationStatusToggle(id, () =>
    setOpen(false),
  );

  return (
    <PopoverScoped open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button type="button" className="shrink-0">
          <AutomationStatusBadge status={status} loading={loading} />
        </button>
      </Popover.Trigger>
      <Popover.Content align="end" className="w-auto p-1">
        <AutomationStatusToggle
          status={status}
          loading={loading}
          setActive={setActive}
        />
      </Popover.Content>
    </PopoverScoped>
  );
};

export const AutomationCard = ({ automation }: { automation: IAutomation }) => {
  const { _id, name, status, triggers, actions, updatedAt } = automation;

  return (
    // Keeps offscreen cards out of layout and paint without a virtualizer.
    <Card className="flex flex-col gap-3 border p-4 [content-visibility:auto] [contain-intrinsic-size:auto_11rem]">
      <div className="flex min-w-0 items-start gap-2">
        <Link
          to={`/automations/edit/${_id}`}
          className="min-w-0 flex-1 truncate font-medium hover:underline"
          title={name}
        >
          {name}
        </Link>
        <AutomationCardStatus id={_id} status={status} />
        <AutomationCardMenu automation={automation} />
      </div>

      <AutomationFlowStrip
        triggers={triggers}
        actions={actions}
        className="min-h-[3.25rem]"
      />

      <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
        <AutomationCardRuns id={_id} />
        {updatedAt && (
          <RelativeDateDisplay value={updatedAt}>
            <RelativeDateDisplay.Value value={updatedAt} />
          </RelativeDateDisplay>
        )}
      </div>
    </Card>
  );
};
