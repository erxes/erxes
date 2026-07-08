import { type TicketPropertyFilter } from '../types';

export const getTopSource = (
  data: { _id: string; percentage: number; count: number }[],
) => {
  return [...data].sort((a, b) => b.percentage - a.percentage)[0];
};

export const getTicketPropertyFilterVariables = (
  propertyFilters: TicketPropertyFilter[],
) => ({
  propertyIds: propertyFilters.length
    ? propertyFilters.map((filter) => filter.propertyId)
    : undefined,
  propertyValueFilters: propertyFilters.some((filter) => filter.values.length)
    ? propertyFilters
        .filter((filter) => filter.values.length)
        .map((filter) => ({
          propertyId: filter.propertyId,
          type: filter.type,
          values: filter.values,
        }))
    : undefined,
});
