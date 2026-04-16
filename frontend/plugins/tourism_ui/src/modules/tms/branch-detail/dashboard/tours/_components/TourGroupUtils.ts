import { ITour, ITourGroup } from '../types/tour';
import { TourGroupRow } from './TourGroupColumns';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
});

const formatDate = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return dateFormatter.format(date);
};

const getTourStartTime = (tour: ITour) => {
  const rawValue =
    tour.dateType === 'flexible' ? tour.availableFrom : tour.startDate;

  return rawValue ? new Date(rawValue).getTime() : 0;
};

const getTourStartLabel = (tour: ITour) => {
  const rawValue =
    tour.dateType === 'flexible' ? tour.availableFrom : tour.startDate;

  return formatDate(rawValue);
};

const sortTours = (items: ITour[]) => {
  return [...items].sort((a, b) => getTourStartTime(a) - getTourStartTime(b));
};

const getGroupDateRangeLabel = (items: ITour[]) => {
  if (!items.length) return '-';

  const sortedItems = sortTours(items);

  const firstItem = sortedItems[0];
  const lastItem = sortedItems[sortedItems.length - 1];
  const startLabel = formatDate(
    firstItem?.dateType === 'flexible'
      ? firstItem?.availableFrom
      : firstItem?.startDate,
  );
  const endLabel = formatDate(
    lastItem?.dateType === 'flexible' ? lastItem?.availableTo : lastItem?.endDate,
  );

  if (startLabel === '-' && endLabel === '-') return '-';

  return `${startLabel} - ${endLabel}`;
};

const sortGroups = (groups: ITourGroup[]) => {
  return [...groups].sort((a, b) => {
    const aTime = Math.max(
      ...a.items.map((item) =>
        item.createdAt ? new Date(item.createdAt).getTime() : 0,
      ),
      0,
    );
    const bTime = Math.max(
      ...b.items.map((item) =>
        item.createdAt ? new Date(item.createdAt).getTime() : 0,
      ),
      0,
    );

    return bTime - aTime;
  });
};

export const flattenGroups = (groups: ITourGroup[]): TourGroupRow[] => {
  return sortGroups(groups).flatMap((group) => {
    const groupId = group._id || 'Ungrouped';
    const groupName =
      group.name?.trim() ||
      group.items.find((item) => item.name?.trim())?.name?.trim() ||
      groupId;
    const sortedItems = sortTours(group.items);

    const parentRow: TourGroupRow = {
      _id: `${groupId}`,
      name: groupName,
      groupCode: groupId,
      templateTourId: sortedItems[0]?._id,
      order: groupId,
      hasChildren: group.items.length > 0,
      isGroup: true,
      childCount: group.items.length,
      dateRangeLabel: getGroupDateRangeLabel(sortedItems),
      statusLabel: `${group.items.length} departures`,
    };

    const childRows: TourGroupRow[] = sortedItems.map((tour, index) => {
      const tourName = tour.name?.trim();
      const isSameAsGroupName =
        !tourName ||
        tourName.localeCompare(groupName, undefined, { sensitivity: 'base' }) ===
          0;
      const startLabel = getTourStartLabel(tour);
      const fallbackLabel =
        startLabel !== '-'
          ? startLabel
          : tour.refNumber?.trim() || `#${index + 1}`;

      return {
        ...tour,
        name: isSameAsGroupName ? fallbackLabel : tourName,
        groupCode: tour.groupCode || groupId,
        templateTourId: tour._id,
        order: `${groupId}/${index + 1}`,
        hasChildren: false,
        isGroup: false,
      };
    });

    return [parentRow, ...childRows];
  });
};
