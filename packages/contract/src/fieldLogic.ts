import { FIELD_LOGIC_ACTIONS, FIELD_LOGIC_OPERATORS } from '@erxes/core-db/enums';
import { z } from 'zod';
import { type CustomValue, Id } from './common';

export { FIELD_LOGIC_ACTIONS, FIELD_LOGIC_OPERATORS };

/** A field shown, or hidden, while every rule matches the record's other values. */
export const FieldLogic = z.object({
  action: z.enum(FIELD_LOGIC_ACTIONS),
  rules: z
    .array(
      z.object({
        fieldId: Id,
        operator: z.enum(FIELD_LOGIC_OPERATORS),
        /** What `is`, `isNot`, `contains`, `greaterThan` and `lessThan` compare with. */
        value: z.string().trim().max(200).nullable().default(null),
      }),
    )
    .min(1)
    .max(10),
});

export type FieldLogic = z.infer<typeof FieldLogic>;

type Rule = FieldLogic['rules'][number];

const texts = (value: CustomValue | undefined) =>
  value === undefined ? [] : (Array.isArray(value) ? value : [value]).map(String);

const matches = (rule: Rule, value: CustomValue | undefined) => {
  const values = texts(value).filter((text) => text !== '');
  const target = rule.value ?? '';

  switch (rule.operator) {
    case 'hasValue':
      return values.length > 0;
    case 'isEmpty':
      return values.length === 0;
    case 'is':
      return values.includes(target);
    case 'isNot':
      return !values.includes(target);
    case 'contains':
      return values.some((text) => text.toLowerCase().includes(target.toLowerCase()));
    case 'greaterThan':
      return values.some((text) => Number(text) > Number(target));
    case 'lessThan':
      return values.some((text) => Number(text) < Number(target));
  }
};

/**
 * Whether a field with `logic` shows on a record holding `values` (by field id): with `show`,
 * only while every rule matches; with `hide`, unless they all do. No logic: always.
 */
export const logicShows = (logic: FieldLogic | null, values: Record<string, CustomValue>) => {
  if (!logic) return true;

  const all = logic.rules.every((rule) => matches(rule, values[rule.fieldId]));

  return logic.action === 'show' ? all : !all;
};
