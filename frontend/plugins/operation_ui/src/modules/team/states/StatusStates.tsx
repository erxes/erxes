import { atom } from 'jotai';
import { TeamStatusTypes } from '@/team/types';

export const addingStatusState = atom<TeamStatusTypes | null>(null);

export const editingStatusState = atom<string | null>(null);
