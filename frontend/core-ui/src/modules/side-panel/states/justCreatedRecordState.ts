import { atom } from 'jotai';

// The record just created from a "Create" button, until another record is
// opened: its panel starts on the first field and skips Activity.
export const justCreatedRecordState = atom<string | null>(null);
