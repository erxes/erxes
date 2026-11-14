// Only the first fields are listed; the rest stay in the JSON below
const VISIBLE_FIELD_LIMIT = 8;

export const useTransformActionResult = (result?: {
  data?: Record<string, unknown>;
}) => {
  const entries = Object.entries(result?.data || {});

  return {
    entries: entries.slice(0, VISIBLE_FIELD_LIMIT),
    hiddenCount: Math.max(entries.length - VISIBLE_FIELD_LIMIT, 0),
    total: entries.length,
  };
};

export const formatValue = (value: unknown) =>
  typeof value === 'object' && value !== null
    ? JSON.stringify(value)
    : String(value);
