import { useAtom } from 'jotai';
import { stored } from 'erxes-ui';
import { useEffect } from 'react';
import { z } from 'zod';

/**
 * A tab opened before an update still knows the old build's file names, and the server only has
 * the new files, so the first page it hasn't loaded yet fails with this error. A reload picks up
 * the new build; nothing else recovers it.
 */
const isStaleBuildError = (error: unknown): boolean =>
  error instanceof Error &&
  (error.name === 'ChunkLoadError' ||
    /^Loading (CSS )?chunk \S+ failed/.test(error.message) ||
    isStaleBuildError(error.cause));

/** At most one reload a minute, so a file that is really missing can't reload the tab forever. */
const RELOAD_GAP_MS = 60_000;

const reloadedAtState = stored({
  key: 'erxes:stale-build:reloaded-at',
  schema: z.number(),
  initial: 0,
  session: true,
});

/** Reloads the tab when `error` comes from an update made since it opened; true for such errors. */
export const useStaleBuildReload = (error: unknown) => {
  const stale = isStaleBuildError(error);
  const [reloadedAt, setReloadedAt] = useAtom(reloadedAtState);

  useEffect(() => {
    if (!stale || Date.now() - reloadedAt < RELOAD_GAP_MS) return;

    setReloadedAt(Date.now());
    window.location.reload();
  }, [stale, reloadedAt, setReloadedAt]);

  return stale;
};
