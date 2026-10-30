const roundRate = (value: number) => Math.round(value * 100) / 100;

export const getRateFromUsefulLife = (usefulLife?: number) =>
  usefulLife && usefulLife > 0 ? roundRate(100 / usefulLife) : undefined;

export const getUsefulLifeFromRate = (annualRate?: number) =>
  annualRate && annualRate > 0 ? roundRate(100 / annualRate) : undefined;
