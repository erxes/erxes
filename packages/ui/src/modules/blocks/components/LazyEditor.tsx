import { lazy, Suspense, type ComponentProps } from 'react';
import { cn } from 'erxes-ui/lib/utils';

const BlockNoteEditor = lazy(async () => ({ default: (await import('./Editor')).Editor }));

/**
 * The block editor, fetched the first time one renders. erxes-ui is one shared chunk that
 * every route loads, and BlockNote with ProseMirror is about a third of it.
 */
export const Editor = (props: ComponentProps<typeof BlockNoteEditor>) => (
  <Suspense
    fallback={
      <div className={cn('h-28 min-h-28 w-full min-w-0 rounded-md shadow-xs', props.className)} />
    }
  >
    <BlockNoteEditor {...props} />
  </Suspense>
);
