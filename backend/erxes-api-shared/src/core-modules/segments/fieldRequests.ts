import { SegmentFieldMeta, SegmentFieldNamespace } from './fieldMeta';
import { SegmentRelationRequest, SegmentValueRequest } from './plan';

/**
 * Sorts the refs a plan handed a plugin into the queries that answer them.
 *
 * Projected fields all come off the same documents, so a plugin reads them in
 * one `find` with a union projection; derived fields each run their own query.
 * Keeping the split here means every plugin's `evaluateFields` is the same
 * shape rather than its own hand-rolled switch.
 */

export type SegmentProjectedRequest = {
  ref: string;
  contentType: string;
  fieldKey: string;
  /** Mongo path on the subject document. */
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
  /** Key inside the namespace, e.g. `company_plan`. */
  entryKey: string;
};

export type SegmentRequestSplit = {
  projected: SegmentProjectedRequest[];
  derived: SegmentDerivedRequest[];
  /** Tenant-keyed entries such as `trackedData.company_plan`. */
  namespaced: SegmentNamespacedRequest[];
  relations: SegmentRelationRequest[];
  /**
   * Refs whose field this plugin does not declare - a segment saved against a
   * field that has since been removed. Report them as unavailable rather than
   * answering "unset", which would quietly change who is in the segment.
   */
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

    const field = (segmentFields[request.contentType] || []).find(
      (candidate) => candidate.key === request.fieldKey,
    );

    if (!field) {
      // A declared field always wins, so a namespace never shadows one.
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

/** Mongo projection covering every projected ref, plus `_id`. */
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

/**
 * Reads one namespaced entry off a document. The entries are an array of
 * `{ field, value }` pairs, so this is a scan of a short list rather than a
 * path walk.
 */
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

/** Namespace array paths a batch needs, for the mongo projection. */
export const namespacePaths = (
  namespaced: SegmentNamespacedRequest[],
): string[] => [
  ...new Set(namespaced.map((request) => request.namespace.path)),
];
