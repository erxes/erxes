export const generateColorCode = (userId: string) => {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }

  const color =
    '#' +
    (hash & 0x00ffffff)
      .toString(16)
      .toUpperCase()
      .padStart(6, '0');

  return color;
};
