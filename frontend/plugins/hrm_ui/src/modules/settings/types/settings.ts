import { DocumentNode } from '@apollo/client';
import { z } from 'zod';

export type HrmReferenceKind =
  | 'contributionProfiles'
  | 'grades'
  | 'seniorityRules'
  | 'skills';

export type HrmReferenceRecord = {
  _id: string;
  code: string;
  name: string;
  description?: string | null;
  status: string;
  employeeRate?: number | null;
  employerRate?: number | null;
  rank?: number | null;
  baseSalary?: number | null;
  allowanceAmount?: number | null;
  allowanceRate?: number | null;
  valueType?: string | null;
  brackets?: { minMonths: number; maxMonths?: number | null; value: number }[];
  category?: string | null;
  score?: number | null;
};

export type ReferenceFormValues = z.infer<typeof referenceFormSchema>;

export type ReferenceField = {
  name: keyof ReferenceFormValues;
  label: string;
  type?: 'text' | 'number' | 'textarea' | 'select';
  options?: { value: string; label: string }[];
};

export type ReferenceConfig = {
  kind: HrmReferenceKind;
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  createLabel: string;
  listQuery: DocumentNode;
  countQuery: DocumentNode;
  createMutation: DocumentNode;
  updateMutation: DocumentNode;
  archiveMutation: DocumentNode;
  listField: string;
  countField: string;
  fields: ReferenceField[];
  buildDoc: (values: ReferenceFormValues) => Record<string, unknown>;
};

export const referenceFormSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  employeeRate: z.coerce.number().min(0).optional(),
  employerRate: z.coerce.number().min(0).optional(),
  rank: z.coerce.number().min(0).optional(),
  baseSalary: z.coerce.number().min(0).optional(),
  allowanceAmount: z.coerce.number().min(0).optional(),
  allowanceRate: z.coerce.number().min(0).optional(),
  valueType: z.string().optional(),
  minMonths: z.coerce.number().min(0).optional(),
  maxMonths: z.coerce.number().min(0).optional(),
  value: z.coerce.number().min(0).optional(),
  category: z.string().optional(),
  score: z.coerce.number().min(0).optional(),
});

export const defaultReferenceValues: ReferenceFormValues = {
  code: '',
  name: '',
  description: '',
  employeeRate: 0,
  employerRate: 0,
  rank: 0,
  baseSalary: 0,
  allowanceAmount: 0,
  allowanceRate: 0,
  valueType: 'percentOfBaseSalary',
  minMonths: 0,
  maxMonths: undefined,
  value: 0,
  category: '',
  score: 0,
};
