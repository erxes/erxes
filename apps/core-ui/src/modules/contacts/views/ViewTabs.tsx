import type { View, ViewRecordType } from '@erxes/core-contract';
import {
  IconChevronDown,
  IconCopy,
  IconDots,
  IconLink,
  IconLock,
  IconPencil,
  IconPlus,
  IconRotate,
  IconTrash,
  IconUsers,
} from '@tabler/icons-react';
import { Button, cn, DropdownMenu, useConfirm, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useCan } from '~/modules/auth/session';
import { SaveViewButton, ViewDialog } from './ViewControls';
import { viewHref } from './viewLinks';
import { useViewMutations, useViewState } from './useViews';
import { useLeadsT } from '~/modules/leads/i18n';

/** Tabs before the rest go under "More". */
const VISIBLE = 5;

const TAB =
  'relative flex h-9 shrink-0 items-center gap-1.5 px-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground';

const ACTIVE =
  'font-medium text-foreground after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:rounded-full after:bg-primary';

/** A saved view's menu: rename, duplicate, share or make private, copy its link, delete. */
const ViewMenu = ({
  view,
  recordType,
  onOpen,
  onClosed,
}: {
  view: View;
  recordType: ViewRecordType;
  onOpen: (view: View | null) => void;
  onClosed: () => void;
}) => {
  const t = useLeadsT();
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const can = useCan();
  const { create, update, remove } = useViewMutations(recordType);
  const [renaming, setRenaming] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            aria-label={t('views.actions', { name: view.name })}
            className="flex size-5 items-center justify-center rounded text-muted-foreground opacity-0 hover:bg-muted group-hover/tab:opacity-100 data-[state=open]:opacity-100"
          >
            <IconDots className="size-3.5" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="start" className="min-w-48">
          {view.editable && (
            <DropdownMenu.Item onSelect={() => setRenaming(true)}>
              <IconPencil />
              {t('views.rename')}
            </DropdownMenu.Item>
          )}
          <DropdownMenu.Item
            onSelect={() =>
              create.mutate(
                {
                  name: t('views.copy', { name: view.name }),
                  filter: view.filter,
                  search: view.search,
                  shared: false,
                },
                { onSuccess: (copy) => onOpen(copy) },
              )
            }
          >
            <IconCopy />
            {t('views.duplicate')}
          </DropdownMenu.Item>
          {view.editable && can('contacts.edit') && (
            <DropdownMenu.Item
              onSelect={() => update.mutate({ id: view.id, shared: !view.shared })}
            >
              {view.shared ? <IconLock /> : <IconUsers />}
              {view.shared ? t('views.private') : t('views.share')}
            </DropdownMenu.Item>
          )}
          <DropdownMenu.Item
            onSelect={() => {
              void navigator.clipboard?.writeText(
                `${window.location.origin}${viewHref(recordType, view)}`,
              );
              toast({
                title: t('views.link-copied'),
                description: t('views.link-copied-description'),
              });
            }}
          >
            <IconLink />
            {t('views.copy-link')}
          </DropdownMenu.Item>
          {view.editable && (
            <>
              <DropdownMenu.Separator />
              <DropdownMenu.Item
                className="text-destructive"
                onSelect={() =>
                  void confirm({
                    message: t('views.delete-confirm', { name: view.name }),
                  }).then(() => remove.mutate(view.id, { onSuccess: onClosed }))
                }
              >
                <IconTrash />
                {t('views.delete')}
              </DropdownMenu.Item>
            </>
          )}
        </DropdownMenu.Content>
      </DropdownMenu>
      <ViewDialog
        open={renaming}
        onOpenChange={setRenaming}
        title={t('views.rename-title')}
        initial={{ name: view.name, shared: view.shared }}
        pending={update.isPending}
        onSave={({ name, shared }) =>
          update.mutate({ id: view.id, name, shared }, { onSuccess: () => setRenaming(false) })
        }
      />
    </>
  );
};

/**
 * Saved views as tabs above a list (as HubSpot and Attio): "All", then each
 * view (shared ones marked), the rest under "More"; a new view saves the list
 * as it is now. While the list differs from the open view: Save, Save as new,
 * Reset.
 */
export const ViewTabs = ({
  recordType,
  allLabel,
}: {
  recordType: ViewRecordType;
  allLabel: string;
}) => {
  const t = useLeadsT();
  const { views, current, changed, query } = useViewState(recordType);
  const { create } = useViewMutations(recordType);
  const [adding, setAdding] = useState(false);
  // The open view stays visible even when it is past the first few.
  const visible = views.slice(0, VISIBLE);

  const shown =
    current && !visible.some((view) => view.id === current.id)
      ? [...visible.slice(0, VISIBLE - 1), current]
      : visible;

  const more = views.filter((view) => !shown.includes(view));

  return (
    <div className="flex min-h-10 shrink-0 items-center gap-1 overflow-x-auto border-b px-3">
      <button
        type="button"
        className={cn(TAB, !current && ACTIVE)}
        onClick={() => query.openView(null)}
      >
        {allLabel}
      </button>
      {shown.map((view) => {
        const active = current?.id === view.id;

        return (
          <div
            key={view.id}
            className={cn('group/tab flex shrink-0 items-center', TAB, 'pr-1', active && ACTIVE)}
          >
            <button
              type="button"
              className="flex items-center gap-1.5"
              onClick={() => query.openView(view)}
              title={view.shared ? t('views.shared') : t('views.mine')}
            >
              {view.shared && <IconUsers className="size-3.5 opacity-60" />}
              <span className="max-w-40 truncate">{view.name}</span>
            </button>
            <ViewMenu
              view={view}
              recordType={recordType}
              onOpen={query.openView}
              onClosed={() => active && query.openView(null)}
            />
          </div>
        );
      })}
      {more.length > 0 && (
        <DropdownMenu>
          <DropdownMenu.Trigger asChild>
            <button type="button" className={TAB}>
              {t('views.more', { count: more.length })}
              <IconChevronDown className="size-3.5" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="start" className="max-h-80 min-w-52 overflow-y-auto">
            {more.map((view) => (
              <DropdownMenu.Item key={view.id} onSelect={() => query.openView(view)}>
                {view.shared ? <IconUsers /> : <IconLock />}
                <span className="truncate">{view.name}</span>
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="h-7 shrink-0 gap-1 px-2 text-muted-foreground"
        onClick={() => setAdding(true)}
      >
        <IconPlus className="size-4" />
        {t('views.new-view')}
      </Button>
      {changed && (
        <div className="ml-auto flex shrink-0 items-center gap-1 pl-2">
          <span className="mr-1 hidden text-xs text-muted-foreground md:inline">
            {current ? t('views.edited') : t('views.filtered')}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-muted-foreground"
            onClick={() => query.openView(current)}
          >
            <IconRotate className="size-3.5" />
            {t('views.reset')}
          </Button>
          <SaveViewButton recordType={recordType} />
        </div>
      )}
      <ViewDialog
        open={adding}
        onOpenChange={setAdding}
        title={t('views.new-view')}
        initial={{ name: '', shared: false }}
        pending={create.isPending}
        onSave={({ name, shared }) =>
          create.mutate(
            {
              name,
              shared,
              filter: query.advanced,
              search: query.search || null,
            },
            {
              onSuccess: (view) => {
                setAdding(false);
                query.openView(view);
              },
            },
          )
        }
      />
    </div>
  );
};
