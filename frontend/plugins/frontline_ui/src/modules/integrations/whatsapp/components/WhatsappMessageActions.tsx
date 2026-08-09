import { useCallback } from 'react';
import { useSetAtom } from 'jotai';
import { Button, Tooltip, cn } from 'erxes-ui';
import { IconArrowBackUp } from '@tabler/icons-react';
import {
  WhatsappReplyTarget,
  whatsappReplyToState,
} from '../states/whatsappReplyToState';

const PREVIEW_LENGTH = 80;

const stripToText = (html?: string): string => {
  if (!html) {
    return '';
  }
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return (doc.body.textContent || '').trim();
};

/**
 * Mirrors DiscordMessageActions — same hover-revealed action bar, same
 * `opacity-0 group-hover:opacity-100` reveal — but scoped to just Reply.
 *
 * Unlike Discord's own API, the WhatsApp Cloud API documents no edit or
 * delete/unsend endpoint for a business's own sent messages, so there is
 * nothing else this bar could offer without it silently failing at Meta.
 */
export const WhatsappMessageActions = ({
  mid,
  content,
}: {
  mid: string;
  content?: string;
}) => {
  const setReplyTo = useSetAtom(whatsappReplyToState);
  const text = stripToText(content);

  const handleReply = useCallback(() => {
    const preview = text.slice(0, PREVIEW_LENGTH) || 'message';
    setReplyTo({ mid, preview } as WhatsappReplyTarget);
  }, [setReplyTo, mid, text]);

  return (
    <Tooltip.Provider delayDuration={0}>
      <div className="flex h-8 shrink-0 items-center gap-px rounded-md border bg-background p-0.5 opacity-0 shadow-xs transition-opacity focus-within:opacity-100 group-hover:opacity-100">
        <Tooltip>
          <Tooltip.Trigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Reply"
              onClick={handleReply}
              className={cn(
                'size-6 rounded-sm p-0 text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              <IconArrowBackUp className="size-4" />
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Content side="top" sideOffset={4}>
            Reply
          </Tooltip.Content>
        </Tooltip>
      </div>
    </Tooltip.Provider>
  );
};
