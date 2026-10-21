import { useDirectMailComposerContext } from '@/integrations/mail/composer/hooks/useDirectMailComposerFields';
import {
  IconArrowsMaximize,
  IconArrowsMinimize,
  IconMinus,
  IconX,
} from '@tabler/icons-react';
import { Button, Sheet } from 'erxes-ui';

export const ComposerHeader = () => {
  const {
    close: onClose,
    setMinimized,
    setExpanded,
    minimized,
    expanded,
    sending: loading,
  } = useDirectMailComposerContext();
  const onMinimize = () => setMinimized((value) => !value);
  const onExpand = () => {
    setMinimized(false);
    setExpanded((value) => !value);
  };
  return (
    <Sheet.Header
      className="flex h-9 flex-none items-center justify-between bg-muted px-4 text-foreground"
      onDoubleClick={(event) => {
        if (
          !(event.target instanceof Element) ||
          !event.target.closest('button')
        )
          onExpand();
      }}
    >
      {minimized ? (
        <Button
          type="button"
          variant="ghost"
          className="h-8 p-0 text-sm font-medium hover:bg-transparent"
          onClick={onMinimize}
        >
          New Message
        </Button>
      ) : (
        <span className="text-sm font-medium">New Message</span>
      )}
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-6"
          aria-label={
            minimized ? 'Restore email composer' : 'Minimize email composer'
          }
          onClick={onMinimize}
        >
          <IconMinus className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-6"
          aria-label={expanded ? 'Exit full screen' : 'Full screen'}
          onClick={onExpand}
        >
          {expanded ? (
            <IconArrowsMinimize className="size-4" />
          ) : (
            <IconArrowsMaximize className="size-4" />
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-6"
          aria-label="Close email composer"
          onClick={onClose}
          disabled={loading}
        >
          <IconX className="size-4" />
        </Button>
      </div>
    </Sheet.Header>
  );
};
