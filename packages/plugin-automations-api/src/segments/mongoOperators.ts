import { TSegmentCondition, TSegmentCompileResult } from "./types";

export const SUPPORTED_MONGO_OPERATORS = new Set([
  "e",
  "dne",
  "c",
  "dnc",
  "it",
  "if",
  "is",
  "ins",
  "numbere",
  "numberdne",
  "numberigt",
  "numberilt",
]);

export const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toNumber = (value: unknown) => {
  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) {
    return null;
  }

  return numberValue;
};

const getCustomFieldId = (field: string) => {
  if (!field.startsWith("customFieldsData.")) {
    return null;
  }

  return field.replace("customFieldsData.", "");
};

const compileRegularPropertyCondition = (
  field: string,
  operator: string,
  value: string | undefined
): TSegmentCompileResult => {
  switch (operator) {
    case "e":
      return { ok: true, selector: { [field]: value } };

    case "dne":
      return { ok: true, selector: { [field]: { $ne: value } } };

    case "c":
      if (!value) {
        return { ok: false, reason: "empty_contains_value" };
      }

      return {
        ok: true,
        selector: {
          [field]: { $regex: escapeRegExp(String(value)), $options: "i" },
        },
      };

    case "dnc":
      if (!value) {
        return { ok: false, reason: "empty_not_contains_value" };
      }

      return {
        ok: true,
        selector: {
          [field]: {
            $not: { $regex: escapeRegExp(String(value)), $options: "i" },
          },
        },
      };

    case "it":
      return { ok: true, selector: { [field]: true } };

    case "if":
      return { ok: true, selector: { [field]: false } };

    case "is":
      return { ok: true, selector: { [field]: { $exists: true } } };

    case "ins":
      return { ok: true, selector: { [field]: { $exists: false } } };

    case "numbere": {
      const numberValue = toNumber(value);

      if (numberValue === null) {
        return { ok: false, reason: "invalid_number_value" };
      }

      return { ok: true, selector: { [field]: numberValue } };
    }

    case "numberdne": {
      const numberValue = toNumber(value);

      if (numberValue === null) {
        return { ok: false, reason: "invalid_number_value" };
      }

      return { ok: true, selector: { [field]: { $ne: numberValue } } };
    }

    case "numberigt": {
      const numberValue = toNumber(value);

      if (numberValue === null) {
        return { ok: false, reason: "invalid_number_value" };
      }

      return { ok: true, selector: { [field]: { $gte: numberValue } } };
    }

    case "numberilt": {
      const numberValue = toNumber(value);

      if (numberValue === null) {
        return { ok: false, reason: "invalid_number_value" };
      }

      return { ok: true, selector: { [field]: { $lte: numberValue } } };
    }

    default:
      return { ok: false, reason: `unsupported_operator:${operator}` };
  }
};

const compileCustomFieldCondition = (
  fieldId: string,
  operator: string,
  value: string | undefined
): TSegmentCompileResult => {
  const elemMatch = (query: Record<string, any>) => ({
    customFieldsData: { $elemMatch: { field: fieldId, ...query } },
  });

  const notElemMatch = (query: Record<string, any>) => ({
    $nor: [elemMatch(query)],
  });

  switch (operator) {
    case "e":
      return { ok: true, selector: elemMatch({ value }) };

    case "dne":
      return { ok: true, selector: notElemMatch({ value }) };

    case "c":
      if (!value) {
        return { ok: false, reason: "empty_contains_value" };
      }

      return {
        ok: true,
        selector: elemMatch({
          value: { $regex: escapeRegExp(String(value)), $options: "i" },
        }),
      };

    case "dnc":
      if (!value) {
        return { ok: false, reason: "empty_not_contains_value" };
      }

      return {
        ok: true,
        selector: notElemMatch({
          value: { $regex: escapeRegExp(String(value)), $options: "i" },
        }),
      };

    case "it":
      return { ok: true, selector: elemMatch({ value: true }) };

    case "if":
      return { ok: true, selector: elemMatch({ value: false }) };

    case "is":
      return { ok: true, selector: elemMatch({ value: { $exists: true } }) };

    case "ins":
      return {
        ok: true,
        selector: notElemMatch({ value: { $exists: true } }),
      };

    case "numbere": {
      const numberValue = toNumber(value);

      if (numberValue === null) {
        return { ok: false, reason: "invalid_number_value" };
      }

      return { ok: true, selector: elemMatch({ value: numberValue }) };
    }

    case "numberdne": {
      const numberValue = toNumber(value);

      if (numberValue === null) {
        return { ok: false, reason: "invalid_number_value" };
      }

      return { ok: true, selector: notElemMatch({ value: numberValue }) };
    }

    case "numberigt": {
      const numberValue = toNumber(value);

      if (numberValue === null) {
        return { ok: false, reason: "invalid_number_value" };
      }

      return {
        ok: true,
        selector: elemMatch({ value: { $gte: numberValue } }),
      };
    }

    case "numberilt": {
      const numberValue = toNumber(value);

      if (numberValue === null) {
        return { ok: false, reason: "invalid_number_value" };
      }

      return {
        ok: true,
        selector: elemMatch({ value: { $lte: numberValue } }),
      };
    }

    default:
      return { ok: false, reason: `unsupported_operator:${operator}` };
  }
};

export const compilePropertyConditionToMongo = (
  condition: TSegmentCondition
): TSegmentCompileResult => {
  const field = condition.propertyName;
  const operator = condition.propertyOperator;
  const value = condition.propertyValue;

  if (!field || !operator) {
    return { ok: false, reason: "missing_property_field_or_operator" };
  }

  if (!SUPPORTED_MONGO_OPERATORS.has(operator)) {
    return { ok: false, reason: `unsupported_operator:${operator}` };
  }

  if (field.startsWith("trackedData.") || field.startsWith("attributes.")) {
    return { ok: false, reason: "nested_field_not_supported" };
  }

  const customFieldId = getCustomFieldId(field);

  if (customFieldId) {
    return compileCustomFieldCondition(customFieldId, operator, value);
  }

  return compileRegularPropertyCondition(field, operator, value);
};
