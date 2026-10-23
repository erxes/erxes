import { gql, useApolloClient } from '@apollo/client';
import { useCallback, useRef, useState } from 'react';
import {
  DataExtensionValue,
  IDataExtensionField,
  IDataExtensionLinkedRecord,
  IDataExtensionRecordResult,
  IDataExtensionRecordType,
  isListRelation,
} from '../types';
import {
  buildPatchMutation,
  buildRecordQuery,
  describeLinkedRecord,
  getSummaryFields,
  LINKED_RECORDS_PAGE,
  typedRequestOptions,
} from '../utils/typedOperations';

type RawLinked = Record<string, unknown> & { _id: string };

type RawRecord = Record<string, unknown> & {
  _id: string;
  dataExtensions?: Record<string, DataExtensionValue | RawLinked | RawLinked[]>;
};

const toLinked = (value: unknown): IDataExtensionLinkedRecord[] =>
  (Array.isArray(value) ? value : value ? [value] : [])
    .filter(
      (item): item is RawLinked =>
        Boolean(item) && typeof item === 'object' && '_id' in item,
    )
    .map((item) => ({ _id: item._id, name: describeLinkedRecord(item) }));

/**
 * Relations come back as nested records. Their ids become the editable
 * value on both sides; the records themselves are kept for display. A
 * has-many list that filled a whole page may be cut off, so it stays
 * read-only rather than unlinking what was not loaded.
 */
const toResult = (
  recordType: IDataExtensionRecordType,
  fields: IDataExtensionField[],
  record: RawRecord,
): IDataExtensionRecordResult => {
  const summary: Record<string, unknown> = {};
  const values: Record<string, DataExtensionValue> = {};
  const links: Record<string, IDataExtensionLinkedRecord[]> = {};
  const editableLinks: string[] = [];
  const raw = record.dataExtensions || {};

  for (const name of getSummaryFields(recordType.typeName)) {
    summary[name] = record[name];
  }

  for (const field of fields) {
    const value = raw[field.key];

    if (!field.relation) {
      values[field.key] = (value as DataExtensionValue) ?? null;
      continue;
    }

    links[field.key] = toLinked(value);

    const list = isListRelation(field.relation);

    if (
      field.relation.side === 'inverse' &&
      list &&
      links[field.key].length >= LINKED_RECORDS_PAGE
    ) {
      continue;
    }

    const ids = links[field.key].map((linked) => linked._id);

    editableLinks.push(field.key);
    values[field.key] = list ? (ids.length ? ids : null) : ids[0] || null;
  }

  return { _id: record._id, summary, values, links, editableLinks };
};

/**
 * Reads and patches one record through the tenant-generated endpoint. The
 * documents are built from the current field definitions.
 */
export const useDataExtensionRecord = (
  recordType: IDataExtensionRecordType | undefined,
  fields: IDataExtensionField[],
  recordTypes: IDataExtensionRecordType[],
) => {
  const client = useApolloClient();
  const [record, setRecord] = useState<IDataExtensionRecordResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  // Bumped on every load and reset; a response from an older generation
  // belongs to a previous record or record type and is dropped.
  const generation = useRef(0);

  const load = useCallback(
    async (_id: string) => {
      if (!recordType) {
        return;
      }

      const current = ++generation.current;

      setLoading(true);
      setError(null);
      setNotFound(false);

      try {
        const { data } = await client.query<{ record: RawRecord | null }>({
          query: gql(buildRecordQuery(recordType, fields, recordTypes)),
          variables: { _id },
          ...typedRequestOptions,
        });

        if (current !== generation.current) {
          return;
        }

        setRecord(
          data.record ? toResult(recordType, fields, data.record) : null,
        );
        setNotFound(!data.record);
      } catch (e) {
        if (current !== generation.current) {
          return;
        }

        setRecord(null);
        setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (current === generation.current) {
          setLoading(false);
        }
      }
    },
    [client, recordType, fields, recordTypes],
  );

  const save = useCallback(
    async (values: Record<string, DataExtensionValue>) => {
      if (!recordType || !record) {
        return null;
      }

      const current = generation.current;

      setSaving(true);

      try {
        const { data } = await client.mutate<{ record: RawRecord | null }>({
          mutation: gql(buildPatchMutation(recordType, fields, recordTypes)),
          variables: { _id: record._id, values },
          ...typedRequestOptions,
        });
        const next = data?.record
          ? toResult(recordType, fields, data.record)
          : null;

        if (current === generation.current) {
          setRecord(next);
        }

        return next;
      } finally {
        setSaving(false);
      }
    },
    [client, recordType, fields, recordTypes, record],
  );

  const reset = useCallback(() => {
    generation.current++;
    setRecord(null);
    setLoading(false);
    setNotFound(false);
    setError(null);
  }, []);

  return { record, notFound, loading, saving, error, load, save, reset };
};

/**
 * Writes extension values onto a record by id, for create forms: the module
 * creates its record first, then the values go to the new id.
 */
export const useDataExtensionValuesWriter = (
  recordType: IDataExtensionRecordType | undefined,
  fields: IDataExtensionField[],
  recordTypes: IDataExtensionRecordType[],
) => {
  const client = useApolloClient();

  return useCallback(
    async (_id: string, values: Record<string, DataExtensionValue>) => {
      if (!recordType || !Object.keys(values).length) {
        return;
      }

      await client.mutate({
        mutation: gql(buildPatchMutation(recordType, fields, recordTypes)),
        variables: { _id, values },
        ...typedRequestOptions,
      });
    },
    [client, recordType, fields, recordTypes],
  );
};
