import { SegmentFieldMeta, SegmentFieldNamespace } from './fieldMeta';
import { SEGMENT_MEMBERSHIP_FIELD } from './nodes';
import { SegmentRelationRequest, SegmentValueRequest } from './plan';

export type SegmentProjectedRequest = {
  ref: string;
  contentType: string;
  fieldKey: string;
  path: string;
};

export type SegmentDerivedRequest = {
  ref: string;
  contentType: string;
  fieldKey: string;
};

export type SegmentNamespacedRequest = {
  ref: string;
  contentType: string;
  fieldKey: string;
  namespace: SegmentFieldNamespace;
  entryKey: string;
};

export type SegmentRequestSplit = {
  projected: SegmentProjectedRequest[];
  derived: SegmentDerivedRequest[];
  namespaced: SegmentNamespacedRequest[];
  relations: SegmentRelationRequest[];
  undeclared: string[];
};

export const splitSegmentFieldRequests = (
  requests: SegmentValueRequest[],
  segmentFields: Record<string, SegmentFieldMeta[]> = {},
  segmentFieldNamespaces: Record<string, SegmentFieldNamespace[]> = {},
): SegmentRequestSplit => {
  const split: SegmentRequestSplit = {
    projected: [],
    derived: [],
    namespaced: [],
    relations: [],
    undeclared: [],
  };

  for (const request of requests) {
    if (request.kind === 'relation') {
      split.relations.push(request);
      continue;
    }

    if (request.fieldKey === SEGMENT_MEMBERSHIP_FIELD) {
      split.projected.push({
        ref: request.ref,
        contentType: request.contentType,
        fieldKey: request.fieldKey,
        path: SEGMENT_MEMBERSHIP_FIELD,
      });
      continue;
    }

    const field = (segmentFields[request.contentType] || []).find(
      (candidate) => candidate.key === request.fieldKey,
    );

    if (!field) {
      const [prefix, ...rest] = request.fieldKey.split('.');
      const namespace = (
        segmentFieldNamespaces[request.contentType] || []
      ).find((candidate) => candidate.prefix === prefix);

      if (namespace && rest.length) {
        split.namespaced.push({
          ref: request.ref,
          contentType: request.contentType,
          fieldKey: request.fieldKey,
          namespace,
          entryKey: rest.join('.'),
        });
        continue;
      }

      split.undeclared.push(request.ref);
      continue;
    }

    if (field.kind === 'derived') {
      split.derived.push({
        ref: request.ref,
        contentType: request.contentType,
        fieldKey: request.fieldKey,
      });
      continue;
    }

    split.projected.push({
      ref: request.ref,
      contentType: request.contentType,
      fieldKey: request.fieldKey,
      path: field.path,
    });
  }

  return split;
};

export const readSegmentPath = (source: unknown, path: string): unknown =>
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

export const projectionForRequests = (
  projected: SegmentProjectedRequest[],
): Record<string, 1> =>
  projected.reduce<Record<string, 1>>(
    (projection, request) => {
      projection[request.path] = 1;
      return projection;
    },
    { _id: 1 },
  );

export const readNamespacedValue = (
  document: Record<string, unknown>,
  request: SegmentNamespacedRequest,
): unknown => {
  const entries = document[request.namespace.path];

  if (!Array.isArray(entries)) {
    return undefined;
  }

  const entry = entries.find(
    (candidate) =>
      (candidate as Record<string, unknown>)?.[request.namespace.keyPath] ===
      request.entryKey,
  );

  return (entry as Record<string, unknown> | undefined)?.[
    request.namespace.valuePath
  ];
};

export const namespacePaths = (
  namespaced: SegmentNamespacedRequest[],
): string[] => [
  ...new Set(namespaced.map((request) => request.namespace.path)),
];
