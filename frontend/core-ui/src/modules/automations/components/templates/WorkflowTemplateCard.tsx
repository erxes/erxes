import { AutomationFlowStrip } from '@/automations/components/list/AutomationFlowStrip';
import { useWorkflowTemplateActions } from '@/automations/hooks/useWorkflowTemplateActions';
import { TWorkflowTemplate } from '@/automations/hooks/useWorkflowTemplateList';
import {
  IconArrowBarToRight,
  IconEdit,
  IconShare,
  IconTrash,
} from '@tabler/icons-react';
import { Button, Card, DropdownMenu, RelativeDateDisplay } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const WorkflowTemplateCardMenu = ({
  template,
  onRemove,
}: {
  template: TWorkflowTemplate;
  onRemove: (templateId: string) => void;
}) => {
  const { t } = useTranslation('automations');
  const actions = useWorkflowTemplateActions({ template, onRemove });

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
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
        className="w-[120px] min-w-0 [&>button]:cursor-pointer"
      >
        <DropdownMenu.Item asChild onSelect={actions.onEdit}>
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <IconEdit className="size-4" />
            {t('edit')}
          </Button>
        </DropdownMenu.Item>
        <DropdownMenu.Item asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-destructive"
            onClick={actions.onRemove}
          >
            <IconTrash className="size-4" />
            {t('delete')}
          </Button>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

export const WorkflowTemplateCard = ({
  template,
  onRemove,
}: {
  template: TWorkflowTemplate;
  onRemove: (templateId: string) => void;
}) => {
  const { _id, name, description, actions, inputs, entryActionId, createdAt } =
    template;

  return (
    // Keeps offscreen cards out of layout and paint without a virtualizer.
    <Card className="flex flex-col gap-3 border p-4 [content-visibility:auto] [contain-intrinsic-size:auto_11rem]">
      <div className="flex min-w-0 items-start gap-2">
        <Link
          to={`/automations/templates/${_id}`}
          className="min-w-0 flex-1 truncate font-medium hover:underline"
          title={name}
        >
          {name}
        </Link>
        <WorkflowTemplateCardMenu template={template} onRemove={onRemove} />
      </div>

      {description && (
        <p
          className="truncate text-xs text-muted-foreground"
          title={description}
        >
          {description}
        </p>
      )}

      <AutomationFlowStrip
        actions={actions}
        entryActionId={entryActionId}
        className="min-h-[3.25rem]"
      />

      <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-3 tabular-nums">
          <span className="flex items-center gap-1">
            <IconShare size={12} />
            {(actions || []).length}
          </span>
          <span className="flex items-center gap-1">
            <IconArrowBarToRight size={12} />
            {Object.keys(inputs || {}).length}
          </span>
        </span>
        {createdAt && (
          <RelativeDateDisplay value={createdAt}>
            <RelativeDateDisplay.Value value={createdAt} />
          </RelativeDateDisplay>
        )}
      </div>
    </Card>
  );
};
