import {atom} from 'jotai';

export const ticketsViewAtom = atom<'list' | 'kanban'>('list');