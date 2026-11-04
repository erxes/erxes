export const domainOf = (address?: string | null) =>
  address?.split('@')[1]?.trim().toLowerCase() || '';
