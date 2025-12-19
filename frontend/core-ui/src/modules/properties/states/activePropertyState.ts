import { atom } from 'jotai';
import { IFieldGroup } from '../types/Properties';

export const activePropertyState = atom<null | IFieldGroup>(null);
