import {
  IconDots,
  IconDownload,
  IconPencil,
  IconPin,
  IconPinnedOff,
} from '@tabler/icons-react';
import { Button, Dialog, DropdownMenu, Input } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { UIMessage } from 'ai';

import { useAgentsThreadActions } from '../hooks/useAgentsThreadActions';
import {
  buildThreadMarkdown,
  downloadThreadMarkdown,
} from '../utils/exportThreadMarkdown';

const TITLE_MAX_LENGTH = 120;

export interface IAgentThreadActionsMenuProps {
  threadId: string;
  title: string;
  pinned: boolean;
  /** Current transcript — export stays disabled while it's empty. */
  messages: UIMessage[];
  triggerClassName?: string;
}

/**
 * Thread actions in the Assistant side-panel header:
 * rename (validated dialog), pin toggle and markdown export.
 * Session deletion belongs to the tab close control. All mutations go through `useAgentsThreadActions`,
 * which refetches both thread lists and toasts success/failure.
 */
export const AgentThreadActionsMenu = ({
  threadId,
  title,
  pinned,
  messages,
  triggerClassName,
}: IAgentThreadActionsMenuProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'agent' });
  const { rename, setPinned, busy } = useAgentsThreadActions();
  const [menuOpen, setMenuOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);

  const displayTitle = title || t('untitled', 'Untitled conversation');

  const submitRename = () => {
    const trimmed = draftTitle.trim();

    if (
      !trimmed ||
      trimmed === title.trim() ||
      trimmed.length > TITLE_MAX_LENGTH
    ) {
      return;
    }

    void rename(threadId, trimmed);
    setRenameOpen(false);
  };

  const handleExport = () => {
    if (messages.length === 0) {
      return;
    }

    const exportedAt = new Date();
    const markdown = buildThreadMarkdown({
      title: displayTitle,
      messages,
      exportedAt,
    });

    downloadThreadMarkdown(title, markdown, exportedAt);
  };

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenu.Trigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={triggerClassName ?? 'size-7'}
            aria-label={t('conversation-actions', 'Conversation actions')}
          >
            <IconDots className="size-4" />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end">
          <DropdownMenu.Item
            onSelect={() => {
              setDraftTitle(title);
              setRenameOpen(true);
            }}
          >
            <IconPencil className="size-4" />
            {t('rename', 'Rename')}
          </DropdownMenu.Item>
          <DropdownMenu.Item onSelect={() => void setPinned(threadId, !pinned)}>
            {pinned ? (
              <IconPinnedOff className="size-4" />
            ) : (
              <IconPin className="size-4" />
            )}
            {pinned ? t('unpin', 'Unpin') : t('pin', 'Pin')}
          </DropdownMenu.Item>
          <DropdownMenu.Item
            disabled={messages.length === 0}
            onSelect={handleExport}
          >
            <IconDownload className="size-4" />
            {t('export-markdown', 'Export as Markdown')}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <Dialog.Content className="max-w-sm">
          <Dialog.Header>
            <Dialog.Title>
              {t('rename-conversation', 'Rename conversation')}
            </Dialog.Title>
          </Dialog.Header>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              submitRename();
            }}
          >
            <Input
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
              maxLength={TITLE_MAX_LENGTH}
              autoFocus
              aria-label={t('conversation-title', 'Conversation title')}
            />
            <Dialog.Footer className="mt-4">
              <Dialog.Close asChild>
                <Button variant="ghost">{t('cancel', 'Cancel')}</Button>
              </Dialog.Close>
              <Button type="submit" disabled={busy || !draftTitle.trim()}>
                {t('save', 'Save')}
              </Button>
            </Dialog.Footer>
          </form>
        </Dialog.Content>
      </Dialog>
    </>
  );
};
