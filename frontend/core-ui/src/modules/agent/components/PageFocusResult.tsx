import { IconFocus2 } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useSyncExternalStore } from 'react';
import { readPageFocus } from '../focus/pageFocusContract';
import {
  pageFocusStatus,
  showPageFocus,
  subscribePageFocus,
} from '../focus/pageFocus';

export const PageFocusResult = ({ output }: { output: unknown }) => {
  const focus = readPageFocus(output);
  const error = useSyncExternalStore(subscribePageFocus, () =>
    focus ? pageFocusStatus(focus) : '',
  );
  if (!focus) return null;
  return (
    <div className="my-2 min-w-0">
      <Button
        variant="ghost"
        size="sm"
        className="h-auto max-w-full gap-2 px-2 py-1.5 text-xs"
        onClick={() => void showPageFocus(focus)}
      >
        <IconFocus2 className="size-3.5 shrink-0" />
        <span className="truncate">Show me: {focus.title}</span>
      </Button>
      {error && (
        <p role="status" className="mt-1 text-xs text-muted-foreground">
          {error}
        </p>
      )}
    </div>
  );
};
