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

type TCompiledSegmentCondition = TSegmentCondition & {
  propertyName: string;
  propertyOperator: string;
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
  'dateigt',
  'dateilt',
  'dateis',
  'dateins',
  'drlt',
  'drgt',
  'woam',
  'wobm',
  'woad',
  'wobd',
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

const normalizeDateValue = (value?: string) => {
  const date = new Date(String(value || ''));

  return Number.isNaN(date.getTime()) ? null : date;
};

const normalizeNumberValue = (value?: string) => {
  const numberValue = Number(value);

  return Number.isNaN(numberValue) ? null : numberValue;
};

const getMinuteRange = (date: Date) => {
  const start = new Date(date);
  start.setSeconds(0, 0);

  const end = new Date(start);
  end.setSeconds(59, 999);

  return { start, end };
};

const getDayRange = (date: Date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const getOffsetDate = (amount: number, unit: 'minute' | 'day') => {
  const date = new Date();

  if (unit === 'minute') {
    date.setMinutes(date.getMinutes() + amount);
  } else {
    date.setDate(date.getDate() + amount);
  }

  return date;
};

const getConditionKind = (condition: TSegmentCondition) => {
  if (condition.type) {
    return condition.type;
  }

  if (condition.subSegmentId || condition.subSegmentForPreview) {
    return 'subSegment' as const;
  }

  if (
    condition.propertyName ||
    condition.propertyOperator ||
    condition.propertyType
  ) {
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
      (condition.subSegmentId
        ? await loadSegment(condition.subSegmentId)
        : null);

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

const compileConditionToMongo = (condition: TCompiledSegmentCondition) => {
  const field = condition.propertyName;
  const operator = condition.propertyOperator;
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
    case 'dateis':
      return {
        $and: [
          { [field]: { $exists: true } },
          {
            $nor: [{ [field]: null }, { [field]: '' }, { [field]: [] }],
          },
        ],
      };

    case 'ins':
    case 'dateins':
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

    case 'dateigt': {
      const date = normalizeDateValue(value);

      return date ? { [field]: { $gte: date } } : null;
    }

    case 'drgt': {
      const date = normalizeDateValue(value);

      return date ? { [field]: { $gte: date } } : null;
    }

    case 'ilt':
    case 'numberilt':
      return { [field]: { $lte: Number(value) } };

    case 'dateilt': {
      const date = normalizeDateValue(value);

      return date ? { [field]: { $lte: date } } : null;
    }

    case 'drlt': {
      const date = normalizeDateValue(value);

      return date ? { [field]: { $lte: date } } : null;
    }

    case 'woam':
    case 'wobm': {
      const offset = normalizeNumberValue(value);

      if (offset === null) {
        return null;
      }

      const amount = operator === 'woam' ? -offset : offset;
      const { start, end } = getMinuteRange(getOffsetDate(amount, 'minute'));

      return { [field]: { $gte: start, $lte: end } };
    }

    case 'woad':
    case 'wobd': {
      const offset = normalizeNumberValue(value);

      if (offset === null) {
        return null;
      }

      const amount = operator === 'woad' ? -offset : offset;
      const { start, end } = getDayRange(getOffsetDate(amount, 'day'));

      return { [field]: { $gte: start, $lte: end } };
    }

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

      const clause = compileConditionToMongo({
        ...condition,
        propertyName: condition.propertyName,
        propertyOperator: condition.propertyOperator,
      });

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
