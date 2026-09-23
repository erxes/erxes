const irregular: Record<string, string> = {
  category: 'categories',
  match: 'matches',
};

export const plural = (count: number, singular: string): string => {
  if (count === 1) {
    return `${count} ${singular}`;
  }

  return `${count} ${irregular[singular] ?? `${singular}s`}`;
};
