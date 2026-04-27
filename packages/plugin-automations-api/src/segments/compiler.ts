import { compilePropertyConditionToMongo } from "./mongoOperators";
import {
  TSegment,
  TSegmentCompileResult,
  TSegmentCondition,
  TSegmentLoader,
} from "./types";

const getConditionKind = (condition: TSegmentCondition) => {
  if (condition.type) {
    return condition.type;
  }

  if (condition.subSegmentId || condition.subSegmentForPreview) {
    return "subSegment" as const;
  }

  if (
    condition.propertyName ||
    condition.propertyOperator ||
    condition.propertyType
  ) {
    return "property" as const;
  }

  return "event" as const;
};

const joinClauses = (
  clauses: Record<string, any>[],
  conjunction: "and" | "or" = "and"
) => {
  if (clauses.length === 1) {
    return clauses[0];
  }

  return conjunction === "or" ? { $or: clauses } : { $and: clauses };
};

const compileSegmentToMongoSelectorInternal = async ({
  segment,
  rootContentType,
  loadSegment,
  visitedSegmentIds,
}: {
  segment?: TSegment | null;
  rootContentType: string;
  loadSegment: TSegmentLoader;
  visitedSegmentIds: Set<string>;
}): Promise<TSegmentCompileResult> => {
  if (!segment) {
    return { ok: false, reason: "segment_not_found" };
  }

  if (segment.contentType !== rootContentType) {
    return { ok: false, reason: "segment_content_type_mismatch" };
  }

  const nextVisitedSegmentIds = new Set(visitedSegmentIds);

  if (segment._id) {
    if (nextVisitedSegmentIds.has(segment._id)) {
      return { ok: false, reason: "segment_cycle_detected" };
    }

    nextVisitedSegmentIds.add(segment._id);
  }

  const ownClauses: Record<string, any>[] = [];

  for (const condition of segment.conditions || []) {
    const conditionKind = getConditionKind(condition);

    if (conditionKind === "event") {
      return { ok: false, reason: "event_condition_not_supported" };
    }

    if (conditionKind === "property") {
      if (!condition.propertyType) {
        return { ok: false, reason: "missing_property_type" };
      }

      if (condition.propertyType !== rootContentType) {
        return { ok: false, reason: "cross_content_property" };
      }

      const result = compilePropertyConditionToMongo(condition);

      if (!result.ok) {
        return result;
      }

      ownClauses.push(result.selector);
      continue;
    }

    if (conditionKind === "subSegment") {
      const nestedSegment =
        condition.subSegmentForPreview ||
        (condition.subSegmentId ? await loadSegment(condition.subSegmentId) : null);

      const nestedResult = await compileSegmentToMongoSelectorInternal({
        segment: nestedSegment,
        rootContentType,
        loadSegment,
        visitedSegmentIds: nextVisitedSegmentIds,
      });

      if (!nestedResult.ok) {
        return nestedResult;
      }

      ownClauses.push(nestedResult.selector);
      continue;
    }

    return { ok: false, reason: "unknown_condition_type" };
  }

  const clauses: Record<string, any>[] = [];

  if (segment.subOf) {
    const parentSegment = await loadSegment(segment.subOf);
    const parentResult = await compileSegmentToMongoSelectorInternal({
      segment: parentSegment,
      rootContentType,
      loadSegment,
      visitedSegmentIds: nextVisitedSegmentIds,
    });

    if (!parentResult.ok) {
      return parentResult;
    }

    clauses.push(parentResult.selector);
  }

  if (ownClauses.length) {
    clauses.push(
      joinClauses(ownClauses, segment.conditionsConjunction || "and")
    );
  }

  if (!clauses.length) {
    return { ok: false, reason: "empty_segment" };
  }

  return { ok: true, selector: joinClauses(clauses, "and") };
};

export const compileSegmentToMongoSelector = async ({
  segment,
  loadSegment,
}: {
  segment: TSegment;
  loadSegment: TSegmentLoader;
}) =>
  compileSegmentToMongoSelectorInternal({
    segment,
    rootContentType: segment.contentType,
    loadSegment,
    visitedSegmentIds: new Set<string>(),
  });
