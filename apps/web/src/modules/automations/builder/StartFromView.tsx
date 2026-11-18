import type { ConditionGroup, View } from '@erxes/core-contract';
import { messageOf } from '@erxes/core-contract/client';
import { IconLayoutList } from '@tabler/icons-react';
import { Button, DropdownMenu } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useViews } from '~/modules/views/useViews';
import { conditionsFromView, VIEW_LISTS } from './viewConditions';

/** The saved views of the record's lists: customers and leads, or companies and company leads. */
const useSubjectViews = (subject: 'customer' | 'company') => {
  const [first, second] = VIEW_LISTS[subject];
  const lists = [useViews(first), useViews(second)];

  return {
    views: lists.flatMap((list) => list.data?.data ?? []),
    error: lists.find((list) => list.isError)?.error,
  };
};

/** "Replace these conditions with …?", before a copy overwrites what is there. */
const ReplaceConfirm = ({
  view,
  onReplace,
  onCancel,
}: {
  view: View;
  onReplace: () => void;
  onCancel: () => void;
}) => {
  const { t } = useTranslation('automations');

  return (
    <div role="alert" className="flex items-center gap-2 rounded-md border p-2 text-xs">
      <span className="flex-1">
        {t('replace-with-view', 'Replace these conditions with “{{name}}”?', { name: view.name })}
      </span>
      <Button size="sm" onClick={onReplace}>
        {t('replace', 'Replace')}
      </Button>
      <Button size="sm" variant="ghost" tone="muted" onClick={onCancel}>
        {t('cancel', 'Cancel')}
      </Button>
    </div>
  );
};

/** Where the conditions came from, and that the view's search (not a condition) stayed behind. */
const CopiedNote = ({ view }: { view: View }) => {
  const { t } = useTranslation('automations');

  return (
    <p className="text-xs text-muted-foreground">
      {view.search
        ? t(
            'copied-from-view-search',
            'Copied from “{{name}}”. Its search “{{search}}” isn’t copied: add a condition for it. Changing the view later doesn’t change this.',
            { name: view.name, search: view.search },
          )
        : t(
            'copied-from-view',
            'Copied from “{{name}}”. Changing the view later doesn’t change this.',
            { name: view.name },
          )}
    </p>
  );
};

/**
 * "Start from a saved view": copies a customer, lead or company view's filter into the
 * conditions. A copy, so editing the view later never changes what the automation does. Replacing
 * conditions already there asks first.
 */
export const StartFromView = ({
  subject,
  value,
  onChange,
  disabled,
}: {
  subject: 'customer' | 'company';
  value: ConditionGroup | undefined;
  onChange: (next: ConditionGroup) => void;
  disabled?: boolean;
}) => {
  const { t } = useTranslation('automations');
  const { views, error } = useSubjectViews(subject);
  const [pending, setPending] = useState<View | null>(null);
  const [copied, setCopied] = useState<View | null>(null);

  const copy = (view: View) => {
    onChange(conditionsFromView(view));
    setPending(null);
    setCopied(view);
  };

  if (error)
    return (
      <p className="text-xs text-destructive-text">
        {t('views-failed', 'Saved views didn’t load: {{message}}', { message: messageOf(error) })}
      </p>
    );

  if (!views.length) return null;

  return (
    <div className="space-y-2">
      <DropdownMenu>
        <DropdownMenu.Trigger
          disabled={disabled}
          render={<Button size="sm" variant="ghost" tone="muted" />}
        >
          <IconLayoutList />
          {t('start-from-view', 'Start from a saved view')}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="start" className="w-64">
          {views.map((view) => (
            <DropdownMenu.Item
              key={view.id}
              onClick={() => (value?.rules.length ? setPending(view) : copy(view))}
            >
              <span className="truncate">{view.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {t(`view-list.${view.recordType}`, view.recordType)}
              </span>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu>
      {pending && (
        <ReplaceConfirm
          view={pending}
          onReplace={() => copy(pending)}
          onCancel={() => setPending(null)}
        />
      )}
      {copied && !pending && <CopiedNote view={copied} />}
    </div>
  );
};
