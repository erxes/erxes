import type { IField } from 'ui-modules';
import type { TicketPropertyFilter } from '@/report/types';

export const getPropertyFilterLabel = (
  filters: TicketPropertyFilter[],
  field: IField,
): string => {
  const filter = filters.find((item) => item.propertyId === field._id);

  if (!filter) {
    return '';
  }

  if (field.type === 'date') {
    if (filter.values.length > 1) {
      return `${filter.values[0]} - ${filter.values[1]}`;
    }

    return filter.values[0] || 'Selected';
  }

  return (
    filter.values
      .map(
        (value) =>
          field.options?.find((option) => option.value === value)?.label ||
          value,
      )
      .join(', ') || 'Selected'
  );
};

export const getPropertyFilterValues = (
  filters: TicketPropertyFilter[],
  fieldId: string,
): string[] =>
  filters.find((item) => item.propertyId === fieldId)?.values || [];

export const setPropertyFilterValues = ({
  filters,
  field,
  values,
}: {
  filters: TicketPropertyFilter[];
  field: IField;
  values: string[];
}): TicketPropertyFilter[] => {
  const otherFilters = filters.filter((item) => item.propertyId !== field._id);

  return [
    ...otherFilters,
    {
      propertyId: field._id,
      type: field.type,
      values,
    },
  ];
};

export const clearPropertyFilter = (
  filters: TicketPropertyFilter[],
  fieldId: string,
): TicketPropertyFilter[] =>
  filters.filter((item) => item.propertyId !== fieldId);

export const getLocalDateFromFilterValue = (
  value: string,
): Date | undefined => {
  const [year, month, day] = value.split('-').map(Number);

  if (!year || !month || !day) {
    return undefined;
  }

  return new Date(year, month - 1, day);
};

export const getPropertyDateRangeValue = (values: string[]): string => {
  if (values.length < 2) {
    const date = values[0] ? getLocalDateFromFilterValue(values[0]) : undefined;

    if (!date) {
      return '';
    }

    return `${date.toISOString()},${date.toISOString()}`;
  }

  const from = getLocalDateFromFilterValue(values[0]);
  const to = getLocalDateFromFilterValue(values[1]);

  if (!from || !to) {
    return '';
  }

  return `${from.toISOString()},${to.toISOString()}`;
};
