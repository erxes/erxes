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

const getGroupDateRangeLabel = (items: ITour[]) => {
  if (!items.length) return '-';

  const sortedItems = [...items].sort((a, b) => {
    const aTime = a.startDate ? new Date(a.startDate).getTime() : 0;
    const bTime = b.startDate ? new Date(b.startDate).getTime() : 0;
    return aTime - bTime;
  });

  const startLabel = formatDate(sortedItems[0]?.startDate);
  const endLabel = formatDate(sortedItems[sortedItems.length - 1]?.endDate);

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
    const parentRow: TourGroupRow = {
      _id: `${groupId}`,
      name: groupId,
      order: groupId,
      hasChildren: group.items.length > 0,
      isGroup: true,
      childCount: group.items.length,
      dateRangeLabel: getGroupDateRangeLabel(group.items),
      statusLabel: `${group.items.length} tours`,
    };

    const childRows: TourGroupRow[] = group.items.map((tour, index) => ({
      ...tour,
      order: `${groupId}/${index + 1}`,
      hasChildren: false,
      isGroup: false,
    }));

    return [parentRow, ...childRows];
  });
};
