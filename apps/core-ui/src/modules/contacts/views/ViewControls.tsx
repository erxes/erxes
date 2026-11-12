import type { ConditionGroup, View, ViewRecordType } from '@erxes/core-contract';
import { IconAdjustmentsHorizontal, IconDeviceFloppy } from '@tabler/icons-react';
import { Badge, Button, Dialog, Input, Label, Popover, Switch } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCan } from '~/modules/auth/session';
import { ConditionsEditor } from '~/modules/automations/builder/ConditionsEditor';
import { useFilterFields, useListQuery, useViewMutations, useViewState } from './useViews';

const countRules = (group: ConditionGroup | null): number =>
  group ? group.rules.reduce((sum, rule) => sum + ('match' in rule ? countRules(rule) : 1), 0) : 0;

/**
 * "Filter" in the list's filter bar: the full builder (fields, properties,
 * the company, activity; and/or groups), applied as it changes.
 */
export const AdvancedFilterButton = ({ recordType }: { recordType: ViewRecordType }) => {
  const { t } = useTranslation('contact', { keyPrefix: 'views' });
  const fields = useFilterFields(recordType);
  const { advanced, setAdvanced } = useListQuery();
  const [draft, setDraft] = useState<ConditionGroup | null>(null);
  const [open, setOpen] = useState(false);
  const count = countRules(advanced);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setDraft(advanced ?? { match: 'all', rules: [] });
      }}
    >
      <Popover.Trigger asChild>
        <Button variant={count ? 'secondary' : 'ghost'} size="sm" className="h-7">
          <IconAdjustmentsHorizontal />
          {t('advanced', 'Advanced')}
          {count > 0 && <Badge className="ml-1 h-4 px-1.5 text-[10px]">{count}</Badge>}
        </Button>
      </Popover.Trigger>
      <Popover.Content align="start" className="w-[min(720px,90vw)] space-y-3 p-4">
        <p className="text-sm font-medium">{t('advanced-title', 'Show records where')}</p>
        {fields ? (
          <ConditionsEditor
            fields={fields}
            subject={recordType === 'company' ? 'company' : 'customer'}
            value={draft ?? undefined}
            onChange={(next) => setDraft(next ?? null)}
          />
        ) : (
          <p className="text-sm text-muted-foreground">{t('loading', 'Loading fields…')}</p>
        )}
        <div className="flex justify-end gap-2 border-t pt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setAdvanced(null);
              setOpen(false);
            }}
          >
            {t('clear', 'Clear')}
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setAdvanced(draft);
              setOpen(false);
            }}
          >
            {t('apply', 'Apply')}
          </Button>
        </div>
      </Popover.Content>
    </Popover>
  );
};

export const ViewDialog = ({
  open,
  onOpenChange,
  title,
  initial,
  onSave,
  pending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  initial: { name: string; shared: boolean };
  onSave: (value: { name: string; shared: boolean }) => void;
  pending: boolean;
}) => {
  const { t } = useTranslation('contact', { keyPrefix: 'views' });
  const can = useCan();
  const [name, setName] = useState(initial.name);
  const [shared, setShared] = useState(initial.shared);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) {
          setName(initial.name);
          setShared(initial.shared);
        }
        onOpenChange(next);
      }}
    >
      <Dialog.Content className="sm:max-w-md">
        <Dialog.HeaderCombined
          title={title}
          description={t(
            'save-description',
            'Saves the filter and search; it always shows the latest records.',
          )}
        />
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (name.trim()) onSave({ name: name.trim(), shared });
          }}
        >
          <div className="space-y-1.5">
            <Label>{t('name', 'Name')}</Label>
            <Input
              autoFocus
              value={name}
              maxLength={80}
              placeholder={t('name-placeholder', 'VIP customers in Ulaanbaatar')}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          {can('contacts.edit') && (
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={shared} onCheckedChange={setShared} />
              {t('share', 'Share with the team')}
            </label>
          )}
          <Button type="submit" className="w-full" disabled={!name.trim() || pending}>
            {t('save', 'Save view')}
          </Button>
        </form>
      </Dialog.Content>
    </Dialog>
  );
};

/** "Save view" when the list shows something unsaved; "Update" too when a view of one's own is open and changed. */
export const SaveViewButton = ({ recordType }: { recordType: ViewRecordType }) => {
  const { t } = useTranslation('contact', { keyPrefix: 'views' });
  const { current, changed, query } = useViewState(recordType);
  const { create, update } = useViewMutations(recordType);
  const [open, setOpen] = useState(false);

  if (!changed) return null;

  const values = { filter: query.advanced, search: query.search || null };

  return (
    <div className="flex items-center gap-1">
      {current?.editable && (
        <Button
          size="sm"
          variant="secondary"
          className="h-7"
          disabled={update.isPending}
          onClick={() => update.mutate({ id: current.id, ...values })}
        >
          <IconDeviceFloppy />
          {t('update', 'Update “{{name}}”', { name: current.name })}
        </Button>
      )}
      <Button size="sm" variant="ghost" className="h-7" onClick={() => setOpen(true)}>
        <IconDeviceFloppy />
        {current ? t('save-new', 'Save as new view') : t('save', 'Save view')}
      </Button>
      <ViewDialog
        open={open}
        onOpenChange={setOpen}
        title={t('save', 'Save view')}
        initial={{ name: '', shared: false }}
        pending={create.isPending}
        onSave={({ name, shared }) =>
          create.mutate(
            { name, shared, ...values },
            {
              onSuccess: (view) => {
                setOpen(false);
                query.openView(view);
              },
            },
          )
        }
      />
    </div>
  );
};
