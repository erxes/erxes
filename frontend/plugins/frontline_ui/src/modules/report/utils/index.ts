export const getTopSource = (
  data: { _id: string; percentage: number; count: number }[],
) => {
  return [...data].sort((a, b) => b.percentage - a.percentage)[0];
};
