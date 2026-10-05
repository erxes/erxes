import { atom } from 'jotai';
import { IFieldGroup } from '../types/Properties';

export const activeLayoutGroupState = atom<null | IFieldGroup>(null);
