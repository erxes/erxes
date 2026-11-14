import type { View, ViewRecordType } from '@erxes/core-contract';
import {
  IconBookmark,
  IconChevronDown,
  IconCopy,
  IconDotsVertical,
  IconLayoutList,
  IconLink,
  IconLock,
  IconPencil,
  IconPlus,
  IconStack2,
  IconTrash,
  IconUsers,
} from '@tabler/icons-react';
import { Button, DropdownMenu, TabButton, useConfirm, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconTip } from '~/components/IconTip';
import { messageOf } from '~/lib/api';
import { ViewDialog } from './ViewControls';
import { viewHref } from './viewLinks';
import { useCanShareViews, useViewMutations, useViewState } from './useViews';

/** Tabs before the rest go under "More". */
const VISIBLE = 5;

/** Scrolls the open tab into sight when the tabs overflow. */
const reveal = (node: HTMLElement | null) =>
  node?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });

/** The open tab's mark that the list differs from it. */
const EditedDot = () => {
  const { t } = useTranslation('views');

  return (
    <span title={t('edited')} className="flex shrink-0 items-center">
      <span aria-hidden className="size-1.5 rounded-full bg-primary" />
      <span className="sr-only">{t('edited')}</span>
    </span>
  );
};

/** Copies a view's address, saying whether it worked. */
const useCopyViewLink = (recordType: ViewRecordType) => {
  const { t } = useTranslation('views');
  const { toast } = useToast();

  return (view: View) =>
    navigator.clipboard.writeText(`${window.location.origin}${viewHref(recordType, view)}`).then(
      () => toast({ title: t('link-copied'), description: t('link-copied-description') }),
      (error: unknown) =>
        toast({
          variant: 'destructive',
          title: t('copy-link'),
          description: messageOf(error),
        }),
    );
};

/** Duplicates a view (and opens the copy), or deletes it once confirmed. */
const useViewCopyAndDelete = (
  view: View,
  recordType: ViewRecordType,
  onOpen: (view: View | null) => void,
  onClosed: () => void,
) => {
  const { t } = useTranslation('views');
  const { confirm } = useConfirm();
  const { create, remove } = useViewMutations(recordType);

  return {
    duplicate: () =>
      create.mutate(
        {
          recordType,
          name: t('copy', { name: view.name }),
          filter: view.filter,
          search: view.search,
          shared: false,
        },
        { onSuccess: (copy) => onOpen(copy) },
      ),
    deleteView: () =>
      void confirm({ message: t('delete-confirm', { name: view.name }) }).then(() =>
        remove.mutate({ id: view.id }, { onSuccess: onClosed }),
      ),
  };
};

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
  const { t } = useTranslation('views');
  const canShare = useCanShareViews(recordType);
  const copyLink = useCopyViewLink(recordType);
  const { update } = useViewMutations(recordType);
  const { duplicate, deleteView } = useViewCopyAndDelete(view, recordType, onOpen, onClosed);
  const [renaming, setRenaming] = useState(false);

  return (
    <>
      <DropdownMenu>
        {/* Folded away until the tab is hovered, or the button is focused or open. */}
        <span className="flex w-0 shrink-0 overflow-hidden opacity-0 transition-layout duration-150 group-hover/tab:ml-1 group-hover/tab:w-5 group-hover/tab:opacity-100 has-focus-visible:ml-1 has-focus-visible:w-5 has-focus-visible:opacity-100 has-data-popup-open:ml-1 has-data-popup-open:w-5 has-data-popup-open:opacity-100 motion-reduce:transition-none">
          <DropdownMenu.Trigger
            aria-label={t('actions', { name: view.name })}
            render={<Button variant="ghost" size="icon" className="size-5 shrink-0" />}
          >
            <IconDotsVertical className="size-3.5" />
          </DropdownMenu.Trigger>
        </span>
        <DropdownMenu.Content align="start" className="min-w-48">
          {view.editable && (
            <DropdownMenu.Item onClick={() => setRenaming(true)}>
              <IconPencil />
              {t('rename')}
            </DropdownMenu.Item>
          )}
          <DropdownMenu.Item onClick={duplicate}>
            <IconCopy />
            {t('duplicate')}
          </DropdownMenu.Item>
          {view.editable && canShare && (
            <DropdownMenu.Item onClick={() => update.mutate({ id: view.id, shared: !view.shared })}>
              {view.shared ? <IconLock /> : <IconUsers />}
              {view.shared ? t('private') : t('share')}
            </DropdownMenu.Item>
          )}
          <DropdownMenu.Item onClick={() => void copyLink(view)}>
            <IconLink />
            {t('copy-link')}
          </DropdownMenu.Item>
          {view.editable && (
            <>
              <DropdownMenu.Separator />
              <DropdownMenu.Item variant="destructive" onClick={deleteView}>
                <IconTrash />
                {t('delete')}
              </DropdownMenu.Item>
            </>
          )}
        </DropdownMenu.Content>
      </DropdownMenu>
      <ViewDialog
        recordType={recordType}
        open={renaming}
        onOpenChange={setRenaming}
        title={t('rename-title')}
        initial={{ name: view.name, shared: view.shared }}
        pending={update.isPending}
        onSave={({ name, shared }) =>
          update.mutate({ id: view.id, name, shared }, { onSuccess: () => setRenaming(false) })
        }
      />
    </>
  );
};

/** Views past the first few. */
const MoreViews = ({ views, onOpen }: { views: View[]; onOpen: (view: View) => void }) => {
  const { t } = useTranslation('views');

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger render={<TabButton />}>
        <IconStack2 />
        {t('more', { count: views.length })}
        <IconChevronDown className="opacity-60" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="start" className="max-h-80 min-w-52 overflow-y-auto">
        {views.map((view) => (
          <DropdownMenu.Item key={view.id} onClick={() => onOpen(view)}>
            {view.shared ? <IconUsers /> : <IconLock />}
            <span className="truncate">{view.name}</span>
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

/** Saves the list as it is now as a new view, and opens it. */
const NewViewButton = ({ recordType }: { recordType: ViewRecordType }) => {
  const { t } = useTranslation('views');
  const { query } = useViewState(recordType);
  const { create } = useViewMutations(recordType);
  const [adding, setAdding] = useState(false);

  return (
    <>
      <IconTip label={t('new-view')}>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('new-view')}
          tone="muted"
          className="shrink-0"
          onClick={() => setAdding(true)}
        >
          <IconPlus className="size-4" />
        </Button>
      </IconTip>
      <ViewDialog
        recordType={recordType}
        open={adding}
        onOpenChange={setAdding}
        title={t('new-view')}
        initial={{ name: '', shared: false }}
        pending={create.isPending}
        onSave={({ name, shared }) =>
          create.mutate(
            { recordType, name, shared, filter: query.advanced, search: query.search || null },
            {
              onSuccess: (view) => {
                setAdding(false);
                query.openView(view);
              },
            },
          )
        }
      />
    </>
  );
};

/**
 * Saved views as tabs (as HubSpot and Attio): "All", then each view (shared
 * ones marked), the rest under "More"; a new view saves the list as it is now.
 */
export const ViewTabs = ({
  recordType,
  allLabel,
}: {
  recordType: ViewRecordType;
  allLabel: string;
}) => {
  const { t } = useTranslation('views');
  const { views, error, current, changed, query } = useViewState(recordType);
  // The open view stays visible even when it is past the first few.
  const visible = views.slice(0, VISIBLE);

  const shown =
    current && !visible.some((view) => view.id === current.id)
      ? [...visible.slice(0, VISIBLE - 1), current]
      : visible;

  const more = views.filter((view) => !shown.includes(view));

  return (
    <>
      <TabButton
        type="button"
        aria-current={current ? undefined : 'page'}
        active={!current}
        onClick={() => query.openView(null)}
      >
        <IconLayoutList />
        {allLabel}
        {!current && changed && <EditedDot />}
      </TabButton>
      {error && (
        <span role="alert" className="text-xs text-destructive">
          {messageOf(error)}
        </span>
      )}
      {shown.map((view) => (
        <TabButton
          key={view.id}
          ref={current?.id === view.id ? reveal : undefined}
          render={<div />}
          active={current?.id === view.id}
          split
          className="group/tab"
        >
          <button
            type="button"
            aria-current={current?.id === view.id ? 'page' : undefined}
            className="flex items-center gap-1.5 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            onClick={() => query.openView(view)}
            title={view.shared ? t('shared') : t('mine')}
          >
            {view.shared ? <IconUsers /> : <IconBookmark />}
            <span className="max-w-40 truncate">{view.name}</span>
            {current?.id === view.id && changed && <EditedDot />}
          </button>
          <ViewMenu
            view={view}
            recordType={recordType}
            onOpen={query.openView}
            onClosed={() => {
              if (current?.id === view.id) query.openView(null);
            }}
          />
        </TabButton>
      ))}
      {more.length > 0 && <MoreViews views={more} onOpen={query.openView} />}
      <NewViewButton recordType={recordType} />
    </>
  );
};
