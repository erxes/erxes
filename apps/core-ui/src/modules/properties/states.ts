import type { FieldGroup } from '@erxes/core-contract';
import { atom } from 'jotai';
import type { TArchiveTarget } from './usePropertyMutations';

/** The archive / delete dialog's target. */
export const archiveTargetState = atom<TArchiveTarget | null>(null);

/** Fields ticked in the group tables (by id). */
export const selectedFieldIdsState = atom<Partial<Record<string, true>>>({});

/** The group open in the edit sheet. */
export const activePropertyGroupState = atom<FieldGroup | null>(null);

/** The group open in the layout (field order) sheet. */
export const activeLayoutGroupState = atom<FieldGroup | null>(null);
