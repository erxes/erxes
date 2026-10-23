import { z } from 'zod';

const identifier = z.string().regex(/^[a-zA-Z][a-zA-Z0-9_]{0,31}$/);
const finite = z.number().finite().min(-1e12).max(1e12);
const chartSchema = z.object({
  title: z.string().min(1).max(120),
  assumption: z.string().min(1).max(500),
  inputs: z
    .array(
      z
        .object({
          id: identifier,
          label: z.string().min(1).max(80),
          value: finite,
          min: finite,
          max: finite,
          step: z.number().finite().positive().max(1e12),
          unit: z.string().max(20).optional(),
        })
        .refine(
          (input) =>
            input.min < input.max &&
            input.value >= input.min &&
            input.value <= input.max,
        ),
    )
    .min(1)
    .max(8),
  outputs: z
    .array(
      z.object({
        label: z.string().min(1).max(80),
        unit: z.string().max(20).optional(),
        formula: z
          .array(
            z.union([
              finite,
              identifier,
              z.enum(['+', '-', '*', '/', 'min', 'max']),
            ]),
          )
          .min(1)
          .max(128),
      }),
    )
    .min(1)
    .max(8),
});

export type WhatIfChartSpec = z.infer<typeof chartSchema>;

/** Bounded postfix arithmetic, never eval/Function or property/function access. */
export const evaluateChartFormula = (
  formula: WhatIfChartSpec['outputs'][number]['formula'],
  values: ReadonlyMap<string, number>,
): number | null => {
  if (formula.length > 128) return null;
  const stack: number[] = [];
  for (const token of formula) {
    if (typeof token === 'number') stack.push(token);
    else if (values.has(token)) stack.push(values.get(token) ?? NaN);
    else {
      const right = stack.pop();
      const left = stack.pop();
      if (left === undefined || right === undefined) return null;
      switch (token) {
        case '+':
          stack.push(left + right);
          break;
        case '-':
          stack.push(left - right);
          break;
        case '*':
          stack.push(left * right);
          break;
        case '/':
          if (right === 0) return null;
          stack.push(left / right);
          break;
        case 'min':
          stack.push(Math.min(left, right));
          break;
        case 'max':
          stack.push(Math.max(left, right));
          break;
        default:
          return null;
      }
    }
    if (
      !Number.isFinite(stack[stack.length - 1]) ||
      Math.abs(stack[stack.length - 1]) > 1e15
    )
      return null;
  }
  return stack.length === 1 ? stack[0] : null;
};

export const parseWhatIfChart = (source: string): WhatIfChartSpec | null => {
  if (source.length > 20_000) return null;
  try {
    const parsed = chartSchema.safeParse(JSON.parse(source));
    if (!parsed.success) return null;
    const spec = parsed.data;
    const values = new Map(spec.inputs.map((input) => [input.id, input.value]));
    if (
      values.size !== spec.inputs.length ||
      values.has('min') ||
      values.has('max')
    )
      return null;
    if (
      spec.outputs.some(
        (output) =>
          !output.formula.some(
            (token) => typeof token === 'string' && values.has(token),
          ) || evaluateChartFormula(output.formula, values) === null,
      )
    )
      return null;
    return spec;
  } catch {
    return null;
  }
};
