import { SegmentRelationMeta } from './relationRegistry';
import { SegmentFieldMeta } from './fieldMeta';
import { SegmentFieldNamespace } from './fieldMeta';
import {
  namespacePaths,
  projectionForRequests,
  readNamespacedValue,
  readSegmentPath,
  SegmentDerivedRequest,
  splitSegmentFieldRequests,
} from './fieldRequests';
import { measureSegmentRelations } from './measureRelations';
import { SegmentNode } from './nodes';
import { SegmentSourceResolver } from './ownedSource';
import { SegmentValueRequest } from './plan';
import { SegmentEvaluateFieldsResult } from './types';

export type SegmentOwnerContract = {
  sourceFor: SegmentSourceResolver;
  fields: Record<string, SegmentFieldMeta[]>;
  namespaces?: Record<string, SegmentFieldNamespace[]>;
  relations?: SegmentRelationMeta[];
  resolveDerived?: (input: {
    subjectType: string;
    subjectIds: string[];
    requests: SegmentDerivedRequest[];
  }) => Promise<Record<string, Record<string, unknown>>>;
  rewritePredicate?: (node: SegmentNode) => Promise<SegmentNode>;
};

type ValueTable = Record<string, Record<string, unknown>>;

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

export const evaluateOwnedSegmentFields = async (
  contract: SegmentOwnerContract,
  {
    subjectType,
    subjectIds,
    requests,
    timeZone,
  }: {
    subjectType: string;
    subjectIds: string[];
    requests: SegmentValueRequest[];
    timeZone?: string;
  },
): Promise<SegmentEvaluateFieldsResult> => {
  const values: ValueTable = {};

  if (!subjectIds.length) {
    return { values, unavailable: requests.map((request) => request.ref) };
  }

  const unavailable: string[] = [];
  const source = contract.sourceFor(subjectType);

  const reachable = requests.filter(
    (request) =>
      request.kind === 'relation' ||
      (Boolean(source) && request.contentType === subjectType),
  );

  for (const request of requests) {
    if (!reachable.includes(request)) {
      unavailable.push(request.ref);
    }
  }

  const split = splitSegmentFieldRequests(
    reachable,
    contract.fields,
    contract.namespaces,
  );

  unavailable.push(...split.undeclared);

  if (source && (split.projected.length || split.namespaced.length)) {
    const projection = projectionForRequests(split.projected);

    for (const path of namespacePaths(split.namespaced)) {
      projection[path] = 1;
    }

    const records = await source.find(
      { ...(source.baseQuery || {}), _id: { $in: subjectIds } },
      projection,
    );

    for (const record of records) {
      const id = String(record._id);

      for (const request of split.projected) {
        put(values, id, request.ref, readSegmentPath(record, request.path));
      }

      for (const request of split.namespaced) {
        put(values, id, request.ref, readNamespacedValue(record, request));
      }
    }
  }

  if (split.derived.length) {
    const derived = contract.resolveDerived
      ? await contract.resolveDerived({
          subjectType,
          subjectIds,
          requests: split.derived,
        })
      : {};

    for (const [subjectId, entries] of Object.entries(derived)) {
      for (const [ref, value] of Object.entries(entries)) {
        put(values, subjectId, ref, value);
      }
    }

    for (const request of split.derived) {
      const answered = Object.values(derived).some(
        (entries) => entries[request.ref] !== undefined,
      );

      if (!answered) {
        unavailable.push(request.ref);
      }
    }
  }

  if (split.relations.length) {
    const measured = await measureSegmentRelations(
      {
        sourceFor: contract.sourceFor,
        relations: contract.relations || [],
        fields: contract.fields,
        timeZone,
        rewritePredicate: contract.rewritePredicate,
      },
      subjectType,
      subjectIds,
      split.relations,
    );

    unavailable.push(...measured.unavailable);

    for (const [subjectId, entries] of Object.entries(measured.values)) {
      values[subjectId] = { ...(values[subjectId] || {}), ...entries };
    }
  }

  return unavailable.length ? { values, unavailable } : { values };
};
