import {
  namespacePaths,
  projectionForRequests,
  readNamespacedValue,
  SegmentEvaluateFieldsResult,
  SegmentValueRequest,
  splitSegmentFieldRequests,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { CORE_SEGMENT_FIELDS } from './fields';
import { CORE_SEGMENT_FIELD_NAMESPACES } from './namespaces';

/**
 * Resolves a batch of core records against the refs a segment plan assigned to
 * this service.
 *
 * One find per batch, never per subject: the projection is the union of every
 * projected path plus the namespace arrays the batch touches.
 */

type ValueTable = Record<string, Record<string, unknown>>;

/** Which collection backs each content type a segment can be built on. */
const collectionFor = (
  models: IModels,
  subjectType: string,
): {
  find: (
    query: Record<string, unknown>,
    projection: Record<string, 1>,
  ) => Promise<Record<string, unknown>[]>;
  baseQuery: Record<string, unknown>;
} | null => {
  const wrap =
    (model: { find: (q: unknown, p: unknown) => { lean: () => unknown } }) =>
    (query: Record<string, unknown>, projection: Record<string, 1>) =>
      model.find(query, projection).lean() as Promise<
        Record<string, unknown>[]
      >;

  if (subjectType === 'core:contacts.customers') {
    return { find: wrap(models.Customers), baseQuery: {} };
  }

  // A lead is a contact in the same collection, so the state is part of the
  // query rather than a separate model.
  if (subjectType === 'core:contacts.leads') {
    return { find: wrap(models.Customers), baseQuery: { state: 'lead' } };
  }

  if (subjectType === 'core:contacts.companies') {
    return { find: wrap(models.Companies), baseQuery: {} };
  }

  if (subjectType === 'core:organization.users') {
    return { find: wrap(models.Users), baseQuery: {} };
  }

  return null;
};

const put = (
  values: ValueTable,
  subjectId: string,
  ref: string,
  value: unknown,
) => {
  if (value === undefined) {
    return;
  }

  values[subjectId] = { ...(values[subjectId] || {}), [ref]: value };
};

/** Walks a dotted path, spreading over arrays so `emails.0` style paths work. */
const readPath = (source: unknown, path: string): unknown =>
  path.split('.').reduce<unknown>((current, segment) => {
    if (Array.isArray(current)) {
      const collected = current
        .map((item) => (item as Record<string, unknown>)?.[segment])
        .filter((item) => item !== undefined && item !== null);

      return collected.length ? collected : undefined;
    }

    if (current && typeof current === 'object') {
      return (current as Record<string, unknown>)[segment];
    }

    return undefined;
  }, source);

export const evaluateCoreFields = async (
  models: IModels,
  {
    subjectType,
    subjectIds,
    requests,
  }: {
    subjectType: string;
    subjectIds: string[];
    requests: SegmentValueRequest[];
  },
): Promise<SegmentEvaluateFieldsResult> => {
  const values: ValueTable = {};
  const collection = collectionFor(models, subjectType);

  if (!collection || !subjectIds.length) {
    return { values, unavailable: requests.map((request) => request.ref) };
  }

  const unavailable: string[] = [];

  // A field owned by another content type needs a relation to reach it from
  // these ids. Saying so keeps membership untouched instead of deciding it
  // against a value that was never read.
  const reachable = requests.filter(
    (request) =>
      request.kind === 'relation' || request.contentType === subjectType,
  );

  for (const request of requests) {
    if (!reachable.includes(request)) {
      unavailable.push(request.ref);
    }
  }

  const split = splitSegmentFieldRequests(
    reachable,
    CORE_SEGMENT_FIELDS,
    CORE_SEGMENT_FIELD_NAMESPACES,
  );

  unavailable.push(...split.undeclared);
  unavailable.push(...split.relations.map((request) => request.ref));
  // Core declares no derived fields yet.
  unavailable.push(...split.derived.map((request) => request.ref));

  if (split.projected.length || split.namespaced.length) {
    const projection = projectionForRequests(split.projected);

    for (const path of namespacePaths(split.namespaced)) {
      projection[path] = 1;
    }

    const records = await collection.find(
      { ...collection.baseQuery, _id: { $in: subjectIds } },
      projection,
    );

    for (const record of records) {
      const id = String(record._id);

      for (const request of split.projected) {
        put(values, id, request.ref, readPath(record, request.path));
      }

      for (const request of split.namespaced) {
        put(values, id, request.ref, readNamespacedValue(record, request));
      }
    }
  }

  return unavailable.length ? { values, unavailable } : { values };
};
