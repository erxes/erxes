import type { ConditionGroup, View, ViewRecordType } from '@erxes/core-contract';
import { IconAdjustmentsHorizontal, IconDeviceFloppy, IconDots, IconLayoutList, IconPencil, IconTrash, IconUsers, IconX } from '@tabler/icons-react';
import { Badge, Button, cn, Dialog, DropdownMenu, Input, Label, Popover, Sidebar, Switch, useConfirm } from 'erxes-ui';
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

const ViewDialog = ({
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
        <Dialog.HeaderCombined title={title} description={t('save-description', 'Saves the filter and search; it always shows the latest records.')} />
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (name.trim()) onSave({ name: name.trim(), shared });
          }}
        >
          <div className="space-y-1.5">
            <Label>{t('name', 'Name')}</Label>
            <Input autoFocus value={name} maxLength={80} placeholder={t('name-placeholder', 'VIP customers in Ulaanbaatar')} onChange={(event) => setName(event.target.value)} />
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
        <Button size="sm" variant="secondary" className="h-7" disabled={update.isPending} onClick={() => update.mutate({ id: current.id, ...values })}>
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

const ViewItem = ({ view, recordType, active }: { view: View; recordType: ViewRecordType; active: boolean }) => {
  const { t } = useTranslation('contact', { keyPrefix: 'views' });
  const { confirm } = useConfirm();
  const { openView } = useListQuery();
  const { update, remove } = useViewMutations(recordType);
  const [renaming, setRenaming] = useState(false);

  return (
    <Sidebar.MenuItem className="group/view">
      <Sidebar.MenuButton className="px-2" isActive={active} onClick={() => openView(active ? null : view)}>
        {view.shared ? <IconUsers /> : <IconLayoutList />}
        <span className="min-w-0 flex-1 truncate">{view.name}</span>
      </Sidebar.MenuButton>
      {view.editable && (
        <DropdownMenu>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              aria-label={t('actions', 'View actions')}
              className="absolute top-1.5 right-1 flex size-5 items-center justify-center rounded opacity-0 group-hover/view:opacity-100 hover:bg-muted focus:opacity-100"
            >
              <IconDots className="size-3.5" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="start">
            <DropdownMenu.Item onClick={() => setRenaming(true)}>
              <IconPencil />
              {t('rename', 'Rename')}
            </DropdownMenu.Item>
            <DropdownMenu.Item onClick={() => update.mutate({ id: view.id, shared: !view.shared })}>
              <IconUsers />
              {view.shared ? t('unshare', 'Make private') : t('share', 'Share with the team')}
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="text-destructive"
              onClick={() =>
                void confirm({ message: t('delete-confirm', 'Delete the view “{{name}}”? The records stay.', { name: view.name }) }).then(() =>
                  remove.mutate(view.id, { onSuccess: () => active && openView(null) }),
                )
              }
            >
              <IconTrash />
              {t('delete', 'Delete')}
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      )}
      <ViewDialog
        open={renaming}
        onOpenChange={setRenaming}
        title={t('rename', 'Rename')}
        initial={{ name: view.name, shared: view.shared }}
        pending={update.isPending}
        onSave={({ name, shared }) => update.mutate({ id: view.id, name, shared }, { onSuccess: () => setRenaming(false) })}
      />
    </Sidebar.MenuItem>
  );
};

/** The list's saved views in the app sidebar: shared ones first, a click opens (or closes) one. */
export const ViewsNavigation = ({ recordType }: { recordType: ViewRecordType }) => {
  const { t } = useTranslation('contact', { keyPrefix: 'views' });
  const { views, current, filtered } = useViewState(recordType);
  const { openView } = useListQuery();

  if (!views.length) return null;

  return (
    <Sidebar.Group className="px-2 py-1">
      <Sidebar.GroupLabel className="flex items-center">
        <span className="flex-1">{t('title', 'Views')}</span>
        {(current || filtered) && (
          <button type="button" className={cn('rounded p-0.5 hover:bg-muted')} aria-label={t('clear', 'Clear')} onClick={() => openView(null)}>
            <IconX className="size-3.5" />
          </button>
        )}
      </Sidebar.GroupLabel>
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          {views.map((view) => (
            <ViewItem key={view.id} view={view} recordType={recordType} active={current?.id === view.id} />
          ))}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};
