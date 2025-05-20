export const fixNum = (value, p = 4) => {
  const cleanNumber = Number((value ?? '').toString().replace(/,/g, ""));

  if (isNaN(cleanNumber)) {
    return 0;
  }

  return Number(cleanNumber.toFixed(p))
};
