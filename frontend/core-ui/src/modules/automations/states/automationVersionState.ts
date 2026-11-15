import { atom } from 'jotai';

/**
 * Bumped when a version is restored into the builder, so an open node form
 * mounts again with the restored config instead of the one it started with.
 */
export const automationNodeRestoreKeyState = atom(0);
