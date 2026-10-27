import { IconPointer } from '@tabler/icons-react';
import { readImage } from 'erxes-ui';
import { useState } from 'react';
import type { IAgentPageSelectionContext } from '../pageSelections';

/** A reference to what the user selected. It has no file/download actions. */
export const PageSelectionContext = ({
  selection,
}: {
  selection: IAgentPageSelectionContext;
}) => {
  const [failed, setFailed] = useState(false);
  return (
    <div
      role="group"
      aria-label={`Selected page element: ${selection.title}`}
      className="my-2 flex min-w-0 max-w-full items-center gap-2.5 rounded-xl border border-foreground/10 bg-background/40 p-2"
    >
      <div className="flex h-11 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-background">
        {failed ? (
          <IconPointer className="size-4 text-muted-foreground" />
        ) : (
          <img
            src={readImage(selection.snapshot.url)}
            alt={selection.title}
            loading="lazy"
            onError={() => setFailed(true)}
            className="h-full w-full object-contain"
          />
        )}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-medium text-muted-foreground">
          Page selection
        </p>
        <p className="truncate text-xs font-medium" title={selection.title}>
          {selection.title}
        </p>
        <p
          className="truncate text-[10px] text-muted-foreground"
          title={selection.frame || selection.path}
        >
          {selection.frame || selection.path}
        </p>
      </div>
    </div>
  );
};
