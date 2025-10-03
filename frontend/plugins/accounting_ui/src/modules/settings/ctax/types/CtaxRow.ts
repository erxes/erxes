import { z } from 'zod';
import { ctaxFormSchema } from '../constants/ctaxFormSchema';

export interface ICtaxRow {
  _id: string;
  name: string;
  number: string;
  kind: CtaxKind;
  formula: string;
  formulaText: string;
  status: string;
  percent: number;
}

export enum CtaxKind {
  NORMAL = 'normal',
  FORMULA = 'formula',
  TITLE = 'title',
  HIDDEN = 'hidden',
}

export enum CtaxStatus {
  ACTIVE = 'active',
  DELETED = 'deleted',
}

export type TCtaxRowForm = z.infer<typeof ctaxFormSchema>;
