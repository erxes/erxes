const toWords = (value: string) =>
  value.replace(/[-_]+/g, ' ').trim().split(/\s+/).filter(Boolean);

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const pluralize = (value: string) => {
  if (value.endsWith('y') && !/[aeiou]y$/i.test(value)) {
    return `${value.slice(0, -1)}ies`;
  }

  if (/(s|x|z|ch|sh)$/i.test(value)) {
    return `${value}es`;
  }

  return `${value}s`;
};

export const formatEntityLabel = (
  value: string,
  options?: { plural?: boolean; capitalize?: boolean },
) => {
  const words = toWords(value);

  if (words.length === 0) {
    return options?.capitalize ? 'Record' : 'record';
  }

  const normalized = words.map((word, index) => {
    const lower = word.toLowerCase();
    const nextValue =
      options?.plural && index === words.length - 1 ? pluralize(lower) : lower;

    return options?.capitalize ? capitalize(nextValue) : nextValue;
  });

  return normalized.join(' ');
};

export const getEntityLabelFromType = (
  entityType: string,
  options?: { plural?: boolean; capitalize?: boolean },
) => {
  const collectionName = entityType.split('.').pop() || 'record';

  return formatEntityLabel(collectionName, options);
};
