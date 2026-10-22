import { z } from 'zod';
import snakeCase from 'lodash/snakeCase';

export const relationApiName = (
  label: string,
  fallback = 'relation',
): string => {
  const words =
    label
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .match(/[A-Za-z0-9]+/g) ?? [];
  const name = words
    .map((word, index) =>
      index === 0
        ? word.charAt(0).toLowerCase() + word.slice(1)
        : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join('');
  return (/^[a-z]/.test(name) ? name : `${fallback}${name}`).slice(0, 63);
};

export const modelApiName = (label: string): string => {
  const name = snakeCase(label).replace(/[^a-z0-9_]/g, '');
  return (/^[a-z]/.test(name) ? name : `object_${name}`).slice(0, 63);
};

export const dataModelFieldOptions = (
  options: { label: string; value: string }[],
): { label: string; value: string }[] => {
  const used = new Set([
    'true',
    'false',
    'null',
    ...options.map((option) => option.value).filter(Boolean),
  ]);
  return options.map((option) => {
    if (option.value) return option;
    const base = relationApiName(option.label, 'option');
    let value = base;
    let suffix = 2;
    while (used.has(value)) {
      const end = String(suffix++);
      value = `${base.slice(0, 63 - end.length)}${end}`;
    }
    used.add(value);
    return { label: option.label, value };
  });
};

export const dataModelFieldFormSchema = (editing: boolean, modelId: string) =>
  z
    .object({
      name: z
        .string()
        .regex(
          /^[a-z][A-Za-z0-9_]{0,62}$/,
          'Use a name starting with a lowercase letter, followed by letters or numbers.',
        ),
      label: z.string().trim().min(1, 'Enter a field name.').max(100),
      description: z.string().trim().max(2000),
      type: z.string().min(1),
      required: z.boolean(),
      options: z
        .array(z.object({ label: z.string().trim(), value: z.string() }))
        .max(100, 'Use up to 100 options.'),
      targetModelIds: z.array(z.string()).max(20),
      multiple: z.boolean(),
      inverseName: z.string(),
      inverseLabel: z.string(),
    })
    .superRefine((values, context) => {
      if (values.type === 'relation') {
        if (
          values.targetModelIds.length > 1 &&
          values.targetModelIds.includes(modelId)
        )
          context.addIssue({
            code: 'custom',
            path: ['targetModelIds'],
            message:
              'To link this object to itself, select it as the only destination.',
          });
        if (!values.targetModelIds.length)
          context.addIssue({
            code: 'custom',
            path: ['targetModelIds'],
            message: 'Choose a related object.',
          });
        if (!editing && !/^[a-z][A-Za-z0-9_]{0,62}$/.test(values.inverseName))
          context.addIssue({
            code: 'custom',
            path: ['inverseName'],
            message:
              'Use a name starting with a lowercase letter, followed by letters or numbers.',
          });
        if (
          !editing &&
          (!values.inverseLabel.trim() || values.inverseLabel.length > 100)
        )
          context.addIssue({
            code: 'custom',
            path: ['inverseLabel'],
            message: 'Enter a destination field name (up to 100 characters).',
          });
      }
      if (!['select', 'radio', 'multiSelect', 'check'].includes(values.type))
        return;
      if (!values.options.length)
        context.addIssue({
          code: 'custom',
          path: ['options'],
          message: 'Add at least one option.',
        });
      const labels = new Set<string>();
      values.options.forEach((option, index) => {
        if (!option.label || option.label.length > 100)
          context.addIssue({
            code: 'custom',
            path: ['options', index, 'label'],
            message: 'Enter an option name (up to 100 characters).',
          });
        else if (labels.has(option.label.toLocaleLowerCase()))
          context.addIssue({
            code: 'custom',
            path: ['options', index, 'label'],
            message: 'This option already exists. Choose another name.',
          });
        labels.add(option.label.toLocaleLowerCase());
      });
    });

export const dataModelFormSchema = z.object({
  name: z
    .string()
    .trim()
    .regex(
      /^[a-z][a-z0-9_]{0,62}$/,
      'Use 1–63 lowercase letters, numbers or underscores, starting with a letter.',
    ),
  labelSingular: z.string().trim().min(1, 'Enter an object name.').max(100),
  labelPlural: z.string().trim().min(1, 'Enter a name for lists.').max(100),
  description: z.string().trim().max(2000),
});
