export const formatNumber = (num) => {
  return num.toLocaleString(undefined, {
    maximumFractionDigits: 5,
  });
};
