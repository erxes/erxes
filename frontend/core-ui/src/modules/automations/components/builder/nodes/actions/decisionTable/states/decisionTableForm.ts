import {
  DECISION_TABLE_INPUT_TYPES,
  DECISION_TABLE_OUTPUT_TYPES,
  getDecisionCellError,
  TDecisionTableConfig,
  TDecisionTableInput,
} from '@/automations/components/builder/nodes/actions/decisionTable/utils/decisionTableCells';
import { z } from 'zod';

// Row cells are kept as arrays aligned with inputs/outputs so renaming or
// removing a column never orphans a cell; keys are attached on save.
const inputSchema = z.object({
  key: z.string().trim().min(1, 'Key is required'),
  type: z.enum(DECISION_TABLE_INPUT_TYPES),
  value: z.string().default(''),
  optionsText: z.string().default(''),
  rangeMin: z.string().default(''),
  rangeMax: z.string().default(''),
});

const outputSchema = z.object({
  key: z.string().trim().min(1, 'Key is required'),
  type: z.enum(DECISION_TABLE_OUTPUT_TYPES),
});

const rowSchema = z.object({
  id: z.string(),
  when: z.array(z.string()),
  then: z.array(z.string()),
});

const baseSchema = z.object({
  inputs: z.array(inputSchema).min(1, 'Add at least one input'),
  outputs: z.array(outputSchema).min(1, 'Add at least one output'),
  rows: z.array(rowSchema),
  noMatchMode: z.enum(['default', 'fail']),
  noMatchThen: z.array(z.string()),
});

export type TDecisionTableForm = z.infer<typeof baseSchema>;
export type TDecisionTableFormInput = TDecisionTableForm['inputs'][number];

const parseOptions = (optionsText: string) =>
  optionsText
    .split(',')
    .map((option) => option.trim())
    .filter(Boolean);

const parseRange = (
  rangeMin: string,
  rangeMax: string,
): [number, number] | undefined => {
  if (rangeMin.trim() === '' || rangeMax.trim() === '') {
    return undefined;
  }

  const min = Number(rangeMin);
  const max = Number(rangeMax);

  return Number.isFinite(min) && Number.isFinite(max) && min <= max
    ? [min, max]
    : undefined;
};

export const toDecisionTableInput = (
  input: TDecisionTableFormInput,
): TDecisionTableInput => ({
  key: input.key.trim(),
  type: input.type,
  value: input.type === 'segment' ? '' : input.value,
  options: input.type === 'option' ? parseOptions(input.optionsText) : [],
  range:
    input.type === 'number'
      ? parseRange(input.rangeMin, input.rangeMax)
      : undefined,
});

const toRecord = (keys: string[], cells: string[]) =>
  Object.fromEntries(keys.map((key, index) => [key, cells[index] ?? '']));

export const toDecisionTableConfig = (
  form: TDecisionTableForm,
): TDecisionTableConfig => {
  const inputs = form.inputs.map(toDecisionTableInput);
  const inputKeys = inputs.map(({ key }) => key);
  const outputKeys = form.outputs.map(({ key }) => key.trim());

  return {
    inputs,
    outputs: form.outputs.map(({ key, type }) => ({ key: key.trim(), type })),
    rows: form.rows.map(({ id, when, then }) => ({
      id,
      when: toRecord(inputKeys, when),
      then: toRecord(outputKeys, then),
    })),
    noMatch:
      form.noMatchMode === 'fail'
        ? { mode: 'fail' }
        : { mode: 'default', then: toRecord(outputKeys, form.noMatchThen) },
  };
};

export const fromDecisionTableConfig = (
  config?: Partial<TDecisionTableConfig>,
): TDecisionTableForm => {
  const inputs = config?.inputs || [];
  const outputs = config?.outputs || [];
  const noMatch = config?.noMatch;

  return {
    inputs: inputs.map((input) => ({
      key: input.key,
      type: input.type,
      value: input.value || '',
      optionsText: (input.options || []).join(', '),
      rangeMin: input.range ? String(input.range[0]) : '',
      rangeMax: input.range ? String(input.range[1]) : '',
    })),
    outputs: outputs.map(({ key, type }) => ({ key, type })),
    rows: (config?.rows || []).map(({ id, when, then }) => ({
      id,
      when: inputs.map(({ key }) => when?.[key] ?? '*'),
      then: outputs.map(({ key }) => then?.[key] ?? ''),
    })),
    noMatchMode: noMatch?.mode === 'fail' ? 'fail' : 'default',
    noMatchThen: outputs.map(({ key }) =>
      noMatch?.mode === 'default' ? noMatch.then?.[key] ?? '' : '',
    ),
  };
};

const addDuplicateKeyIssues = (
  keys: string[],
  path: 'inputs' | 'outputs',
  ctx: z.RefinementCtx,
) => {
  keys.forEach((key, index) => {
    if (key && keys.indexOf(key) !== index) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [path, index, 'key'],
        message: 'Key must be unique',
      });
    }
  });
};

export const decisionTableFormSchema = baseSchema.superRefine((form, ctx) => {
  addDuplicateKeyIssues(
    form.inputs.map(({ key }) => key.trim()),
    'inputs',
    ctx,
  );
  addDuplicateKeyIssues(
    form.outputs.map(({ key }) => key.trim()),
    'outputs',
    ctx,
  );

  const inputs = form.inputs.map(toDecisionTableInput);

  form.rows.forEach((row, rowIndex) => {
    inputs.forEach((input, inputIndex) => {
      const error = getDecisionCellError(input, row.when[inputIndex] ?? '');

      if (error) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['rows', rowIndex, 'when', inputIndex],
          message: error,
        });
      }
    });
  });

  form.inputs.forEach((input, index) => {
    if (input.type !== 'segment' && !input.value.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['inputs', index, 'value'],
        message: 'Pick where this value comes from',
      });
    }
  });
});
