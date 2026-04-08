type TSegmentCondition = {
  type: 'property' | 'event' | 'subSegment';
  propertyType?: string;
  propertyName?: string;
  propertyOperator?: string;
  propertyValue?: string;
  subSegmentId?: string;
  subSegmentForPreview?: TSegment;
};

type TSegment = {
  _id?: string;
  contentType: string;
  subOf?: string;
  conditions?: TSegmentCondition[];
  conditionsConjunction?: 'and' | 'or';
};

type TSegmentLoader = (segmentId: string) => Promise<TSegment | null>;

const SUPPORTED_MONGO_OPERATORS = new Set([
  'e',
  'dne',
  'c',
  'dnc',
  'it',
  'if',
  'is',
  'ins',
  'igt',
  'ilt',
  'numbere',
  'numberdne',
  'numberigt',
  'numberilt',
]);

const UNSUPPORTED_NESTED_PREFIXES = [
  'customFieldsData.',
  'trackedData.',
  'attributes.',
];

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getConditionKind = (condition: TSegmentCondition) => {
  if (condition.type) {
    return condition.type;
  }

  if (condition.subSegmentId || condition.subSegmentForPreview) {
    return 'subSegment' as const;
  }

  if (condition.propertyName || condition.propertyOperator || condition.propertyType) {
    return 'property' as const;
  }

  return 'event' as const;
};

const collectSegmentContextTypesInternal = async ({
  segment,
  loadSegment,
  visitedSegmentIds,
}: {
  segment?: TSegment | null;
  loadSegment: TSegmentLoader;
  visitedSegmentIds: Set<string>;
}): Promise<Set<string> | null> => {
  if (!segment) {
    return null;
  }

  const nextVisitedSegmentIds = new Set(visitedSegmentIds);

  if (segment._id) {
    if (nextVisitedSegmentIds.has(segment._id)) {
      return null;
    }

    nextVisitedSegmentIds.add(segment._id);
  }

  const contentTypes = new Set<string>();

  if (segment.contentType) {
    contentTypes.add(segment.contentType);
  }

  for (const condition of segment.conditions || []) {
    const conditionKind = getConditionKind(condition);

    if (conditionKind === 'event') {
      return null;
    }

    if (condition.propertyType) {
      contentTypes.add(condition.propertyType);
    }

    if (conditionKind !== 'subSegment') {
      continue;
    }

    const nestedSegment =
      condition.subSegmentForPreview ||
      (condition.subSegmentId ? await loadSegment(condition.subSegmentId) : null);

    if (!nestedSegment) {
      return null;
    }

    const nestedContentTypes = await collectSegmentContextTypesInternal({
      segment: nestedSegment,
      loadSegment,
      visitedSegmentIds: nextVisitedSegmentIds,
    });

    if (!nestedContentTypes) {
      return null;
    }

    for (const type of nestedContentTypes) {
      contentTypes.add(type);
    }
  }

  return contentTypes;
};

const compileConditionToMongo = (condition: TSegmentCondition) => {
  const field = condition.propertyName!;
  const operator = condition.propertyOperator!;
  const value = condition.propertyValue;

  switch (operator) {
    case 'e':
    case 'numbere':
      return { [field]: value };

    case 'dne':
    case 'numberdne':
      return { [field]: { $ne: value } };

    case 'c':
      return {
        [field]: {
          $regex: escapeRegExp(String(value || '')),
          $options: 'i',
        },
      };

    case 'dnc':
      return {
        [field]: {
          $not: {
            $regex: escapeRegExp(String(value || '')),
            $options: 'i',
          },
        },
      };

    case 'it':
      return { [field]: true };

    case 'if':
      return { [field]: false };

    case 'is':
      return {
        $and: [
          { [field]: { $exists: true } },
          {
            $nor: [{ [field]: null }, { [field]: '' }, { [field]: [] }],
          },
        ],
      };

    case 'ins':
      return {
        $or: [
          { [field]: { $exists: false } },
          { [field]: null },
          { [field]: '' },
          { [field]: [] },
        ],
      };

    case 'igt':
    case 'numberigt':
      return { [field]: { $gte: Number(value) } };

    case 'ilt':
    case 'numberilt':
      return { [field]: { $lte: Number(value) } };

    default:
      return null;
  }
};

const compileSegmentToMongoSelectorInternal = async ({
  segment,
  loadSegment,
  visitedSegmentIds,
}: {
  segment?: TSegment | null;
  loadSegment: TSegmentLoader;
  visitedSegmentIds: Set<string>;
}): Promise<Record<string, any> | null> => {
  if (!segment || segment.subOf) {
    return null;
  }

  const nextVisitedSegmentIds = new Set(visitedSegmentIds);

  if (segment._id) {
    if (nextVisitedSegmentIds.has(segment._id)) {
      return null;
    }

    nextVisitedSegmentIds.add(segment._id);
  }

  const clauses: any[] = [];

  for (const condition of segment.conditions || []) {
    const conditionKind = getConditionKind(condition);

    if (conditionKind === 'property') {
      if (!condition.propertyName || !condition.propertyOperator) {
        return null;
      }

      if (condition.propertyType !== segment.contentType) {
        return null;
      }

      if (
        UNSUPPORTED_NESTED_PREFIXES.some((prefix) =>
          condition.propertyName?.startsWith(prefix),
        )
      ) {
        return null;
      }

      if (!SUPPORTED_MONGO_OPERATORS.has(condition.propertyOperator)) {
        return null;
      }

      const clause = compileConditionToMongo(condition);

      if (!clause) {
        return null;
      }

      clauses.push(clause);
      continue;
    }

    if (conditionKind === 'subSegment') {
      const nestedSegment =
        condition.subSegmentForPreview ||
        (condition.subSegmentId
          ? await loadSegment(condition.subSegmentId)
          : null);

      if (!nestedSegment || nestedSegment.contentType !== segment.contentType) {
        return null;
      }

      const nestedSelector = await compileSegmentToMongoSelectorInternal({
        segment: nestedSegment,
        loadSegment,
        visitedSegmentIds: nextVisitedSegmentIds,
      });

      if (!nestedSelector) {
        return null;
      }

      clauses.push(nestedSelector);
      continue;
    }

    return null;
  }

  if (!clauses.length) {
    return null;
  }

  if ((segment.conditionsConjunction || 'and') === 'or') {
    return { $or: clauses };
  }

  return { $and: clauses };
};

export const hasSingleSegmentContentType = async ({
  segment,
  loadSegment,
}: {
  segment?: TSegment | null;
  loadSegment: TSegmentLoader;
}) => {
  const contentTypes = await collectSegmentContextTypesInternal({
    segment,
    loadSegment,
    visitedSegmentIds: new Set<string>(),
  });

  return Boolean(contentTypes && contentTypes.size === 1);
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
    loadSegment,
    visitedSegmentIds: new Set<string>(),
  });
