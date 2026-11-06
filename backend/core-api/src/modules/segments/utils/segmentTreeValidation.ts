import {
  normalizeSegmentOperator,
  SegmentOperator,
} from 'erxes-api-shared/core-modules';
import { createExpectedError } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { listSegmentFields, listSegmentRelations } from './segmentCatalog';

/**
 * Rules a condition tree must meet before it is stored. A save is judged only
 * on the nodes it introduces, so trees written before these rules keep
 * saving; a content type whose catalogue cannot be read is not judged.
 * References to other segments are left to assertReferencesResolvable.
 */

type TOperatorSpec = { value: string; input: string };

export type TSegmentCatalogField = {
  key: string;
  label: string;
  input: string;
  source?: string;
  options?: { value: string }[];
  operators: TOperatorSpec[];
};

export type TSegmentCatalogRelation = {
  key: string;
  label: string;
  relatedType: string;
  measureOperators: TOperatorSpec[];
};

export type TSegmentTreeCatalog = {
  fieldsOf: (contentType: string) => Promise<TSegmentCatalogField[]>;
  relationsOf: (subjectType: string) => Promise<TSegmentCatalogRelation[]>;
};

export type TSegmentTreeIssue = { path: string; message: string };

type TRecord = Record<string, unknown>;

const CONJUNCTIONS = ['and', 'or'];
const MEASURES_COMPARED = ['count', 'sum', 'avg', 'min', 'max'];
const MEASURES_OF_A_FIELD = ['sum', 'avg', 'min', 'max'];
const MEASURES_ALONE = ['exists', 'none'];
// Picker state and nesting say nothing about what a node itself asks.
const NOT_IDENTITY = ['children', 'child', 'meta'];

const isRecord = (value: unknown): value is TRecord =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const OPERATORS: string[] = Object.values(SegmentOperator);

const isSegmentOperator = (value: unknown): value is SegmentOperator =>
  typeof value === 'string' && OPERATORS.includes(value);

/** Retired aliases (numbere, dateis…) read as the operator they stand for. */
const operatorOf = (value: unknown): string =>
  isSegmentOperator(value) ? normalizeSegmentOperator(value) : '';

const stable = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map(stable).join(',')}]`;
  }

  if (isRecord(value)) {
    return `{${Object.entries(value)
      .filter(([, entry]) => entry !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${stable(entry)}`)
      .join(',')}}`;
  }

  return JSON.stringify(value ?? null);
};

const childrenOf = (node: TRecord): unknown[] => [
  ...(Array.isArray(node.children) ? node.children : []),
  ...(node.child !== undefined ? [node.child] : []),
];

const identityOf = (node: TRecord) =>
  stable({
    ...Object.fromEntries(
      Object.entries(node).filter(([key]) => !NOT_IDENTITY.includes(key)),
    ),
    ...(node.kind === 'group' && { empty: !childrenOf(node).length }),
  });

const identitiesOf = (node: unknown, found = new Set<string>()) => {
  if (isRecord(node)) {
    found.add(identityOf(node));
    childrenOf(node).forEach((child) => identitiesOf(child, found));
  }

  return found;
};

const hasCondition = (node: unknown): boolean =>
  isRecord(node) &&
  (node.kind === 'group'
    ? childrenOf(node).some(hasCondition)
    : ['field', 'relation', 'segment'].includes(String(node.kind)));

const isEmptyValue = (value: unknown) =>
  value === undefined ||
  value === null ||
  value === '' ||
  (Array.isArray(value) && !value.length);

const isNumeric = (value: unknown): boolean =>
  Array.isArray(value)
    ? value.length > 0 && value.every(isNumeric)
    : (typeof value === 'number' && Number.isFinite(value)) ||
      (typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value.trim()));

const listOf = (values: string[]) => values.join(', ');

const checkValue = (
  path: string,
  spec: TOperatorSpec,
  value: unknown,
  field?: TSegmentCatalogField,
): TSegmentTreeIssue[] => {
  if (spec.input === 'none') {
    return [];
  }

  if (spec.input === 'number' || field?.input === 'number') {
    return isNumeric(value)
      ? []
      : [{ path: `${path}.value`, message: 'Needs a number' }];
  }

  if (isEmptyValue(value)) {
    return [{ path: `${path}.value`, message: 'Needs a value' }];
  }

  const options = field?.source === 'static' ? field.options : undefined;

  if (!options?.length) {
    return [];
  }

  const allowed = options.map((option) => option.value);
  const picked = (Array.isArray(value) ? value : [value]).map(String);
  const unknown = picked.filter((entry) => !allowed.includes(entry));

  return unknown.length
    ? [
        {
          path: `${path}.value`,
          message: `${listOf(unknown)} is not an option of ${
            field?.label
          }; use ${listOf(allowed)}`,
        },
      ]
    : [];
};

const checkField = async (
  node: TRecord,
  path: string,
  subjectType: string | undefined,
  catalog: TSegmentTreeCatalog,
): Promise<TSegmentTreeIssue[]> => {
  const contentType =
    typeof node.contentType === 'string' ? node.contentType : subjectType;

  if (subjectType && contentType !== subjectType) {
    return [
      {
        path: `${path}.contentType`,
        message: `This condition is about ${subjectType}, not ${contentType}`,
      },
    ];
  }

  const fields = contentType ? await catalog.fieldsOf(contentType) : [];

  if (!fields.length) {
    return [];
  }

  const field = fields.find(({ key }) => key === node.fieldKey);

  if (!field) {
    return [
      {
        path: `${path}.fieldKey`,
        message: `"${node.fieldKey}" is not a field of ${contentType}; pick one from segmentFields(contentType: "${contentType}")`,
      },
    ];
  }

  const operator = operatorOf(node.operator);
  const spec = field.operators.find(({ value }) => value === operator);

  if (!spec) {
    return [
      {
        path: `${path}.operator`,
        message: `"${node.operator}" does not apply to ${
          field.label
        }; use ${listOf(field.operators.map(({ value }) => value))}`,
      },
    ];
  }

  return checkValue(path, spec, node.value, field);
};

const checkRelation = async (
  node: TRecord,
  path: string,
  subjectType: string | undefined,
  catalog: TSegmentTreeCatalog,
): Promise<{
  relation?: TSegmentCatalogRelation;
  issues: TSegmentTreeIssue[];
}> => {
  const relations = subjectType ? await catalog.relationsOf(subjectType) : [];
  const relation = relations.find(({ key }) => key === node.relationKey);

  if (!relations.length) {
    return { issues: [] };
  }

  if (!relation) {
    return {
      issues: [
        {
          path: `${path}.relationKey`,
          message: `"${node.relationKey}" is not a relation of ${subjectType}; pick one from segmentRelations(subjectType: "${subjectType}")`,
        },
      ],
    };
  }

  const measure = isRecord(node.measure) ? String(node.measure.op) : '';

  if (![...MEASURES_ALONE, ...MEASURES_COMPARED].includes(measure)) {
    return {
      relation,
      issues: [
        {
          path: `${path}.measure.op`,
          message: `Use one of ${listOf([
            ...MEASURES_ALONE,
            ...MEASURES_COMPARED,
          ])}`,
        },
      ],
    };
  }

  const issues: TSegmentTreeIssue[] = [];

  if (MEASURES_OF_A_FIELD.includes(measure) && isRecord(node.measure)) {
    const fields = await catalog.fieldsOf(relation.relatedType);
    const fieldKey = node.measure.fieldKey;

    if (fields.length && !fields.some(({ key }) => key === fieldKey)) {
      issues.push({
        path: `${path}.measure.fieldKey`,
        message: `"${fieldKey}" is not a field of ${relation.relatedType}`,
      });
    }
  }

  if (MEASURES_COMPARED.includes(measure)) {
    const operator = operatorOf(node.operator);
    const spec = relation.measureOperators.find(
      ({ value }) => value === operator,
    );
    // A count or a sum is compared as a number, whatever it counts.
    const measured: TSegmentCatalogField = {
      key: relation.key,
      label: relation.label,
      input: 'number',
      operators: relation.measureOperators,
    };

    issues.push(
      ...(spec
        ? checkValue(path, spec, node.value, measured)
        : [
            {
              path: `${path}.operator`,
              message: `Compare the ${measure} with ${listOf(
                relation.measureOperators.map(({ value }) => value),
              )}`,
            },
          ]),
    );
  }

  return { relation, issues };
};

export const findSegmentTreeIssues = async (
  {
    contentType,
    root,
    previous,
  }: { contentType: string; root: unknown; previous?: unknown },
  catalog: TSegmentTreeCatalog,
): Promise<TSegmentTreeIssue[]> => {
  const known =
    previous === undefined ? new Set<string>() : identitiesOf(previous);
  const issues: TSegmentTreeIssue[] = [];

  if (
    !hasCondition(root) &&
    (previous === undefined || hasCondition(previous))
  ) {
    issues.push({
      path: 'root',
      message:
        'Add at least one condition; a segment without conditions matches nothing',
    });
  }

  const visit = async (
    node: unknown,
    path: string,
    subjectType: string | undefined,
  ): Promise<void> => {
    if (!isRecord(node)) {
      issues.push({ path, message: 'Is not a condition' });
      return;
    }

    const introduced = !known.has(identityOf(node));

    if (node.kind === 'group') {
      if (introduced && !CONJUNCTIONS.includes(String(node.conjunction))) {
        issues.push({ path: `${path}.conjunction`, message: 'Use and or or' });
      }

      for (const [index, child] of childrenOf(node).entries()) {
        await visit(child, `${path}.children.${index}`, subjectType);
      }

      return;
    }

    if (node.kind === 'field') {
      if (introduced) {
        issues.push(...(await checkField(node, path, subjectType, catalog)));
      }

      return;
    }

    if (node.kind === 'relation') {
      const { relation, issues: found } = introduced
        ? await checkRelation(node, path, subjectType, catalog)
        : {
            relation: subjectType
              ? (await catalog.relationsOf(subjectType)).find(
                  ({ key }) => key === node.relationKey,
                )
              : undefined,
            issues: [],
          };

      issues.push(...found);

      if (node.child !== undefined) {
        await visit(node.child, `${path}.child`, relation?.relatedType);
      }

      return;
    }

    if (node.kind !== 'segment' && introduced) {
      issues.push({
        path: `${path}.kind`,
        message: `"${node.kind}" is not a condition kind; use group, field, relation or segment`,
      });
    }
  };

  await visit(root, 'root', contentType);

  return issues;
};

const memoize = <T>(load: (key: string) => Promise<T>) => {
  const loaded = new Map<string, Promise<T>>();

  return (key: string) => {
    const cached = loaded.get(key);

    if (cached) {
      return cached;
    }

    const next = load(key);

    loaded.set(key, next);

    return next;
  };
};

export const assertSegmentTree = async (
  models: IModels,
  input: { contentType: string; root: unknown; previous?: unknown },
) => {
  const issues = await findSegmentTreeIssues(input, {
    fieldsOf: memoize((contentType) => listSegmentFields(models, contentType)),
    relationsOf: memoize((subjectType) => listSegmentRelations(subjectType)),
  });

  if (issues.length) {
    throw createExpectedError(
      `Cannot save segment:\n${issues
        .map(({ path, message }) => `${path}: ${message}`)
        .join('\n')}`,
      'SEGMENT_TREE_INVALID',
    );
  }
};
