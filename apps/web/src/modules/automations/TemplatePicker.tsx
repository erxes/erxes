import type { AutomationDefinition } from '@erxes/core-contract';
import { IconBolt, IconCalendarEvent, IconClock, IconHandFinger } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Dialog } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';
import { orpc } from '~/lib/api';

export const TRIGGER_ICONS = {
  event: IconBolt,
  schedule: IconClock,
  date: IconCalendarEvent,
  manual: IconHandFinger,
} as const;

export const TriggerIcon = ({
  kind,
  className,
}: {
  kind: keyof typeof TRIGGER_ICONS;
  className?: string;
}) => {
  const Icon = TRIGGER_ICONS[kind];

  return <Icon className={className} />;
};

const TemplateList = ({
  onPick,
}: {
  onPick: (template: { name: string; definition: AutomationDefinition }) => void;
}) => {
  const templates = useQuery(orpc.automations.templates.queryOptions());

  return (
    <QueryState query={templates}>
      {({ data }) => (
        <ul className="grid gap-2 sm:grid-cols-2">
          {data.map((template) => (
            <li key={template.id}>
              <button
                type="button"
                className="h-full w-full rounded-lg border p-3 text-left hover:bg-muted"
                onClick={() => onPick(template)}
              >
                <p className="flex items-center gap-2 font-medium">
                  <TriggerIcon
                    kind={template.definition.trigger.kind}
                    className="size-4 text-primary-text"
                  />
                  {template.name}
                </p>
                <p className="text-sm text-muted-foreground">{template.description}</p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </QueryState>
  );
};

/** Ready-made automations; picking one creates a copy to change before turning it on. */
export const TemplatePicker = ({
  open,
  onOpenChange,
  onPick,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (template: { name: string; definition: AutomationDefinition }) => void;
}) => {
  const { t } = useTranslation('automations');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="sm:max-w-2xl">
        <Dialog.HeaderCombined
          title={t('templates', 'Start from a template')}
          description={t(
            'templates-description',
            'A ready-made automation you can change before turning it on.',
          )}
        />
        {open && <TemplateList onPick={onPick} />}
      </Dialog.Content>
    </Dialog>
  );
};
