import { performance } from 'node:perf_hooks';
import { setImmediate } from 'node:timers/promises';
import { Script, createContext } from 'node:vm';
import { GraphQLError } from 'graphql';
import valueValidator from 'validator';
import type { IModels } from '~/connectionResolvers';
import type { IFieldValidator } from './db/definitions/fieldValidator';
import { VALIDATION_REGISTRY } from './validationRegistry';

const BATCH_SIZE = 500;
const TIME_LIMIT_MS = 10_000;
const PAGE_SIZE = 20;

export const isCompatibleFormFieldValue = (
  value: unknown,
  target: string,
): boolean => {
  if (value === null || value === undefined || value === '') return true;
  if (target === 'date' || target === 'core:customer:birthDate') {
    return value instanceof Date
      ? !Number.isNaN(value.getTime())
      : typeof value === 'string' &&
          valueValidator.isISO8601(value, { strict: true }) &&
          !Number.isNaN(Date.parse(value));
  }
  if (typeof value !== 'string' && typeof value !== 'number') return false;
  if (typeof value === 'number' && !Number.isSafeInteger(value)) return false;
  const text = String(value);
  if (target === 'core:customer:email') return valueValidator.isEmail(text);
  if (target === 'core:customer:phone')
    return /^\d{8,}$/.test(text.replace(/[\s()+-.]|ext/gi, ''));
  if (target === 'number')
    return (
      Number.isSafeInteger(Number(value)) && String(Number(value)) === text
    );
  return true;
};

export const conversionError = (
  reason: string,
  message: string,
  details: Record<string, string | number> = {},
): GraphQLError =>
  new GraphQLError(message, {
    extensions: { code: 'FORM_FIELD_CONVERSION', reason, ...details },
  });

interface AnswerExample {
  id: string;
  submissionId?: string;
  submittedAt?: Date;
  value: string;
  reason: string;
}

export interface ConversionInspection {
  checkedCount: number;
  invalidCount: number;
  matchingCount: number;
  examples: AnswerExample[];
  hasMore: boolean;
}

// Compile once per scan, not once per answer. Custom patterns run in a VM with
// a real execution deadline: Promise.race cannot interrupt a synchronous regex.
const createValidator = (config: IFieldValidator) => {
  if (config.type === 'CUSTOM' && config.customRegex) {
    if (config.customRegex.length > 500) {
      throw conversionError(
        'INVALID_VALIDATOR',
        'The validation pattern is too long.',
      );
    }
    const context = createContext({ source: config.customRegex, values: [] });
    try {
      new Script('const pattern = new RegExp(source);').runInContext(context, {
        timeout: 100,
      });
    } catch {
      throw conversionError(
        'INVALID_VALIDATOR',
        'The validation pattern is invalid.',
      );
    }
    const script = new Script('values.map(value => pattern.test(value))');
    return (values: string[]): boolean[] => {
      context.values = values;
      try {
        // The script is constant and returns only booleans; user input is data.
        return script.runInContext(context, { timeout: 100 }) as boolean[];
      } catch {
        throw conversionError(
          'VALIDATION_TIMEOUT',
          'Validation took too long. Simplify the validation rule and try again.',
        );
      } finally {
        context.values = [];
      }
    };
  }
  const preset =
    config.type === 'PRESET' && config.presetKey
      ? VALIDATION_REGISTRY[config.presetKey]
      : undefined;
  return (values: string[]): boolean[] =>
    values.map(
      (value) =>
        !preset ||
        preset.pattern.test(
          config.presetKey === 'MN_VEHICLE_REGISTRATION'
            ? value.toUpperCase()
            : value,
        ),
    );
};

export const inspectFieldConversion = async (
  models: IModels,
  formId: string,
  fieldId: string,
  targetType: string,
  validator: IFieldValidator = { type: 'NONE' },
  options: {
    page?: number;
    search?: string;
    stopOnInvalid?: boolean;
    deadline?: number;
  } = {},
): Promise<ConversionInspection> => {
  const validate = createValidator(validator);
  const start = performance.now();
  const deadline = Math.min(
    start + TIME_LIMIT_MS,
    options.deadline ?? Infinity,
  );
  const page = options.page ?? 1;
  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    page > 100_000 ||
    (options.search?.length ?? 0) > 200
  ) {
    throw conversionError('INVALID_REQUEST', 'Invalid review page or search.');
  }
  const search = (options.search ?? '').trim().toLocaleLowerCase();
  const result: ConversionInspection = {
    checkedCount: 0,
    invalidCount: 0,
    matchingCount: 0,
    examples: [],
    hasMore: false,
  };
  let batch: {
    example: AnswerExample;
    text: string;
    compatible: boolean;
    empty: boolean;
  }[] = [];
  let characters = 0;
  const checkDeadline = () => {
    if (performance.now() > deadline) {
      throw conversionError(
        'VALIDATION_TIMEOUT',
        'Validation took too long. No fields were changed.',
      );
    }
  };
  const flush = async () => {
    checkDeadline();
    const valid = validate(
      batch.map((item) => (item.empty || !item.compatible ? '' : item.text)),
    );
    for (const [index, item] of batch.entries()) {
      result.checkedCount++;
      if (item.empty || (item.compatible && valid[index])) continue;
      result.invalidCount++;
      if (search && !item.text.toLocaleLowerCase().includes(search)) continue;
      result.matchingCount++;
      if (
        result.matchingCount > (page - 1) * PAGE_SIZE &&
        result.examples.length < PAGE_SIZE
      ) {
        result.examples.push({
          ...item.example,
          reason: item.compatible ? 'VALIDATOR' : 'TYPE',
        });
      }
    }
    batch = [];
    characters = 0;
    // Yield even when MongoDB already has the next batch buffered.
    await setImmediate();
    checkDeadline();
  };
  const cursor = models.FormSubmissions.find({ formId, formFieldId: fieldId })
    .read('primary')
    .select('_id groupId submittedAt value')
    .sort({ _id: 1 })
    .maxTimeMS(Math.max(1, Math.floor(deadline - performance.now())))
    .lean()
    .cursor({ batchSize: BATCH_SIZE });
  try {
    for await (const answer of cursor) {
      const value: unknown = answer.value;
      const empty = value === undefined || value === null || value === '';
      const text =
        value instanceof Date
          ? Number.isNaN(value.getTime())
            ? 'Invalid date'
            : value.toISOString()
          : String(value ?? '');
      batch.push({
        example: {
          id: answer._id,
          submissionId: answer.groupId,
          submittedAt: answer.submittedAt,
          value: text.slice(0, 200),
          reason: '',
        },
        text,
        empty,
        compatible: isCompatibleFormFieldValue(value, targetType),
      });
      characters += text.length;
      if (batch.length >= BATCH_SIZE || characters >= 64_000) {
        await flush();
        if (options.stopOnInvalid && result.invalidCount) break;
      }
    }
    if (batch.length) await flush();
  } catch (error) {
    if (error instanceof GraphQLError) throw error;
    if (error instanceof Error && 'code' in error && error.code === 50) {
      throw conversionError(
        'VALIDATION_TIMEOUT',
        'Validation took too long. No fields were changed.',
      );
    }
    throw error;
  } finally {
    await cursor.close();
  }
  result.hasMore = result.matchingCount > page * PAGE_SIZE;
  return result;
};
