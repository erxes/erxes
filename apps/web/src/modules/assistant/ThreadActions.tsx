import type { AssistantThread } from '@erxes/core-contract';
import {
  IconDots,
  IconDownload,
  IconPencil,
  IconPin,
  IconPinnedOff,
  IconSettings,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Dialog,
  DropdownMenu,
  IconTip,
  Input,
  Label,
  useConfirm,
  useToast,
} from 'erxes-ui';
import type { UIMessage } from 'ai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { saveFile } from '~/lib/files';
import { threadMarkdown } from './exportMarkdown';
import { paths } from '~/lib/paths';
import { type StoredThread, threadKey, threadTitle, useThread } from './useThread';

const useThreadMutations = (onDeleted: (threadId: string) => void) => {
  const client = useQueryClient();
  const { toast } = useToast();
  const onError = (error: Error) => toast({ variant: 'destructive', title: messageOf(error) });

  const refresh = (id: string) =>
    Promise.all([
      client.invalidateQueries({ queryKey: orpc.assistant.threads.key() }),
      client.invalidateQueries({ queryKey: threadKey(id) }),
    ]);

  return {
    update: useMutation(
      orpc.assistant.updateThread.mutationOptions({
        onSuccess: (_result, { id }) => refresh(id),
        onError,
      }),
    ),
    remove: useMutation(
      orpc.assistant.removeThread.mutationOptions({
        onSuccess: (_result, { id }) => {
          onDeleted(id);
          void refresh(id);
        },
        onError,
      }),
    ),
  };
};

const RenameDialog = ({
  thread,
  open,
  onOpenChange,
  onSave,
}: {
  thread: AssistantThread;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (title: string) => void;
}) => {
  const { t } = useTranslation('assistant');
  const [title, setTitle] = useState(thread.title ?? '');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="sm:max-w-md">
        <Dialog.HeaderCombined
          title={t('rename-title', 'Rename conversation')}
          description={t('rename-description', 'The new title shows in its tab and in history.')}
        />
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();

            if (title.trim()) onSave(title.trim());
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="assistant-thread-title">{t('title-label', 'Title')}</Label>
            <Input
              id="assistant-thread-title"
              value={title}
              maxLength={120}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={!title.trim()}>
            {t('save', 'Save')}
          </Button>
        </form>
      </Dialog.Content>
    </Dialog>
  );
};

const exportThread = (messages: UIMessage[], title: string) =>
  saveFile(
    new Blob([threadMarkdown(title, messages, window.location.origin)], {
      type: 'text/markdown',
    }),
    `${title}.md`,
  );

const ThreadMenu = ({
  thread,
  onRename,
  onPin,
  onCloseTab,
  onDelete,
}: {
  thread: StoredThread | undefined;
  onRename: () => void;
  onPin: () => void;
  onCloseTab: () => void;
  onDelete: () => void;
}) => {
  const { t } = useTranslation('assistant');
  const navigate = useNavigate();
  const messages = thread?.messages ?? null;

  return (
    <DropdownMenu.Content align="end" className="min-w-48">
      {thread && (
        <>
          <DropdownMenu.Item onClick={onRename}>
            <IconPencil />
            {t('rename', 'Rename')}
          </DropdownMenu.Item>
          <DropdownMenu.Item onClick={onPin}>
            {thread.pinned ? <IconPinnedOff /> : <IconPin />}
            {thread.pinned ? t('unpin', 'Unpin') : t('pin', 'Pin')}
          </DropdownMenu.Item>
          <DropdownMenu.Item
            disabled={messages === null}
            onClick={() => {
              if (messages) exportThread(messages, threadTitle(thread, t));
            }}
          >
            <IconDownload />
            {t('export', 'Export as Markdown')}
          </DropdownMenu.Item>
          <DropdownMenu.Item onClick={onCloseTab}>
            <IconX />
            {t('close-tab-short', 'Close tab')}
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
        </>
      )}
      <DropdownMenu.Item onClick={() => void navigate(paths.settings.assistant)}>
        <IconSettings />
        {t('open-settings', 'Assistant settings')}
      </DropdownMenu.Item>
      {thread && (
        <>
          <DropdownMenu.Separator />
          <DropdownMenu.Item variant="destructive" onClick={onDelete}>
            <IconTrash />
            {t('delete', 'Delete')}
          </DropdownMenu.Item>
        </>
      )}
    </DropdownMenu.Content>
  );
};

export const ThreadActions = ({
  threadId,
  onCloseTab,
  onDeleted,
}: {
  threadId: string | null;
  onCloseTab: () => void;
  onDeleted: (threadId: string) => void;
}) => {
  const { t } = useTranslation('assistant');
  const { confirm } = useConfirm();
  const thread = useThread(threadId).data;
  const [renaming, setRenaming] = useState(false);
  const { update, remove } = useThreadMutations(onDeleted);

  return (
    <>
      <DropdownMenu>
        <IconTip label={t('actions', 'Conversation actions')}>
          <DropdownMenu.Trigger
            aria-label={t('actions', 'Conversation actions')}
            render={<Button variant="ghost" size="icon" />}
          >
            <IconDots className="size-4" />
          </DropdownMenu.Trigger>
        </IconTip>
        <ThreadMenu
          thread={thread}
          onRename={() => setRenaming(true)}
          onPin={() => thread && update.mutate({ id: thread.id, pinned: !thread.pinned })}
          onCloseTab={onCloseTab}
          onDelete={() =>
            thread &&
            void confirm({
              message: t('delete-confirm', 'Delete this conversation? This cannot be undone.'),
              options: { okLabel: t('delete', 'Delete'), variants: { ok: 'destructive' } },
            }).then(() => remove.mutate({ id: thread.id }))
          }
        />
      </DropdownMenu>
      {thread && renaming && (
        <RenameDialog
          thread={thread}
          open={renaming}
          onOpenChange={setRenaming}
          onSave={(next) =>
            update.mutate({ id: thread.id, title: next }, { onSuccess: () => setRenaming(false) })
          }
        />
      )}
    </>
  );
};
