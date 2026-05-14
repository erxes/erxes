import { atom } from 'jotai';
import { BoardItemProps } from 'erxes-ui';

export const fetchedTicketsState = atom<BoardItemProps[]>([]);