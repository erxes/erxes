const number = '-?\\d+(?:\\.\\d+)?';
const conditionPattern = new RegExp(
  `^\\w+\\s*(>=|<=|!=|>|<|=)\\s*(${number})\\s*:\\s*(\\[?${number}\\]?)$`,
);
const numeric = new RegExp(`^${number}$`);
const parsePercent = (text: string) => {
  const value = text.trim();
  if (numeric.test(value) && Number.isFinite(Number(value)))
    return { fallback: Number(value), conditions: [] };
  const match = /^if\((.+)\)\s*(-?\d+(?:\.\d+)?)$/.exec(value);
  if (!match) throw new Error('Invalid percentage rule');
  const conditions = match[1].split(',').map((condition) => {
    const parts = conditionPattern.exec(condition.trim());
    if (!parts || parts[3].startsWith('[') !== parts[3].endsWith(']'))
      throw new Error('Invalid percentage condition');
    const threshold = Number(parts[2]);
    const percent = Number(parts[3].replace('[', '').replace(']', ''));
    if (!Number.isFinite(threshold) || !Number.isFinite(percent))
      throw new Error('Percentage values must be finite');
    return {
      operator: parts[1],
      threshold,
      percent,
      progressive: parts[3].startsWith('['),
    };
  });
  if (!Number.isFinite(Number(match[2])))
    throw new Error('Percentage must be finite');
  return { fallback: Number(match[2]), conditions };
};
export const validateReportPercent = (text: string): void => {
  parsePercent(text);
};
export const applyReportPercent = (amount: number, text: string): number => {
  const { fallback, conditions } = parsePercent(text);
  for (const { operator, threshold, percent, progressive } of conditions) {
    const matches =
      operator === '>'
        ? amount > threshold
        : operator === '>='
        ? amount >= threshold
        : operator === '<'
        ? amount < threshold
        : operator === '<='
        ? amount <= threshold
        : operator === '!='
        ? amount !== threshold
        : amount === threshold;
    if (matches)
      return operator === '>' && progressive
        ? (threshold * fallback + (amount - threshold) * percent) / 100
        : (amount * percent) / 100;
  }
  return (amount * fallback) / 100;
};
