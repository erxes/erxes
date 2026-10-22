import { gql } from '@apollo/client';
import {
  Kind,
  visit,
  type DocumentNode,
  type FieldNode,
  type SelectionSetNode,
} from 'graphql';
import type { ModelField } from './types';

export type BuiltinModelName = 'customer' | 'company' | 'product' | 'user';
export interface BuiltinModelRecord {
  _id: string;
  _dataModelVersion?: number | null;
}
const typeNames: Record<BuiltinModelName, string> = {
  customer: 'Customer',
  company: 'Company',
  product: 'Product',
  user: 'User',
};

export const builtinFieldValue = (record: object, name: string): unknown =>
  Reflect.get(record, name);

export const withBuiltinModelFields = (
  document: DocumentNode,
  model: BuiltinModelName,
  fields: ModelField[],
  paths: readonly (readonly string[])[],
): DocumentNode => {
  const names = fields
    .filter((field) => !field.archivedAt)
    .map((field) => field.name);
  if (!names.length) return document;
  if (names.some((name) => !/^[a-z][A-Za-z0-9_]{0,62}$/.test(name)))
    throw new Error('Invalid model field identity');
  const extend = (selectionSet: SelectionSetNode): SelectionSetNode => {
    const selected = new Set(
      selectionSet.selections
        .filter(
          (node): node is FieldNode => node.kind === Kind.FIELD && !node.alias,
        )
        .map((node) => node.name.value),
    );
    return {
      ...selectionSet,
      selections: [
        ...selectionSet.selections,
        ...['_dataModelVersion', ...names]
          .filter((name) => !selected.has(name))
          .map(
            (name): FieldNode => ({
              kind: Kind.FIELD,
              name: { kind: Kind.NAME, value: name },
              ...(fields.find((field) => field.name === name)?.type ===
              'relation'
                ? {
                    selectionSet: {
                      kind: Kind.SELECTION_SET,
                      selections: [
                        {
                          kind: Kind.FIELD,
                          name: { kind: Kind.NAME, value: '_id' },
                        },
                      ],
                    },
                  }
                : {}),
            }),
          ),
      ],
    };
  };
  return visit(document, {
    Field(node, _key, _parent, _path, ancestors) {
      if (!node.selectionSet) return;
      const parentNames = ancestors.flatMap((entry) =>
        !Array.isArray(entry) && 'kind' in entry && entry.kind === Kind.FIELD
          ? [entry.name.value]
          : [],
      );
      const path = [...parentNames, node.name.value];
      if (
        paths.some(
          (expected) =>
            expected.length === path.length &&
            expected.every((name, index) => name === path[index]),
        )
      )
        return { ...node, selectionSet: extend(node.selectionSet) };
    },
    FragmentDefinition(node) {
      if (node.typeCondition.name.value === typeNames[model])
        return { ...node, selectionSet: extend(node.selectionSet) };
    },
    InlineFragment(node) {
      if (node.typeCondition?.name.value === typeNames[model])
        return { ...node, selectionSet: extend(node.selectionSet) };
    },
  });
};

export const builtinModelUpdateDocument = (
  model: BuiltinModelName,
  fields: ModelField[],
): DocumentNode => {
  if (fields.some((field) => !/^[a-z][A-Za-z0-9_]{0,62}$/.test(field.name)))
    throw new Error('Invalid model field identity');
  return gql(`mutation dataModelsUi_${model}SaveFields($_id: String!, $expectedVersion: Int!, $input: DataModel_${model}UpdateInput!) {
    dataModel_${model}UpdateFields(_id: $_id, expectedVersion: $expectedVersion, input: $input) { _id version }
  }`);
};
