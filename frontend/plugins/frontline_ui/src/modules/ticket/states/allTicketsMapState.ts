import { atom } from 'jotai';   
import { ITicket } from '@/ticket/types';


export const allTicketsMapState = atom<Record<string, ITicket>>({});
