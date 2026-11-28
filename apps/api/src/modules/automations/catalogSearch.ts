import type { ActionInfo } from '@erxes/core-contract';

interface Text {
  label: string;
  rest: string;
}

const wordsOf = (text: string) =>
  text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 1);

const scoreOf = ({ label, rest }: Text, words: string[]) => {
  const named = wordsOf(label);
  const other = wordsOf(rest);

  return words.reduce(
    (score, word) =>
      score +
      (named.some((part) => part.startsWith(word)) ? 2 : 0) +
      (other.some((part) => part.startsWith(word)) ? 1 : 0),
    0,
  );
};

export const actionText = (action: ActionInfo): Text => ({
  label: `${action.label} ${action.type}`,
  rest: `${action.description ?? ''} ${action.integrationName ?? ''} ${action.source}`,
});

export const ranked = <T>(items: T[], query: string, textOf: (item: T) => Text) => {
  const words = wordsOf(query);

  if (!words.length) return items;

  const scored = items.map((item) => ({ item, score: scoreOf(textOf(item), words) }));
  const best = Math.max(0, ...scored.map(({ score }) => score));

  return scored
    .filter(({ score }) => score > 0 && score * 2 >= best)
    .toSorted((a, b) => b.score - a.score)
    .map(({ item }) => item);
};
