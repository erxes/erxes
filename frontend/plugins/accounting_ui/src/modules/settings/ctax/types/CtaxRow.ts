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

export const CTAX_KIND_LABELS = {
  [CtaxKind.NORMAL]: 'Энгийн',
  [CtaxKind.FORMULA]: 'Томьёо',
  [CtaxKind.TITLE]: 'Гарчиг',
  [CtaxKind.HIDDEN]: 'Нуусан',
};

export enum CtaxStatus {
  ACTIVE = 'active',
  DELETED = 'deleted',
}

export const CTAX_STATUS_LABELS = {
  [CtaxStatus.ACTIVE]: 'Идэвхтэй',
  [CtaxStatus.DELETED]: 'Устгасан',
};

export type TCtaxRowForm = z.infer<typeof ctaxFormSchema>;
