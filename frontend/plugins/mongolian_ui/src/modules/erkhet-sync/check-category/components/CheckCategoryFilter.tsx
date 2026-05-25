import { IconCirclePlus, IconEdit, IconTrash } from '@tabler/icons-react';
import { useCheckCategory } from '../hooks/useCheckCategory';
import { CategoryStatus } from '../types/categoryItem';

interface FilterConfig {
  value: CategoryStatus;
  label: string;
  icon: React.ElementType;
  activeClass: string;
  inactiveClass: string;
  badgeClass: string;
}

const FILTERS: FilterConfig[] = [
  {
    value: 'create',
    label: 'Create',
    icon: IconCirclePlus,
    activeClass: 'bg-green-600 text-white border-green-600',
    inactiveClass: 'bg-white text-green-700 border-green-300 hover:bg-green-50',
    badgeClass: 'bg-green-100 text-green-700',
  },
  {
    value: 'update',
    label: 'Update',
    icon: IconEdit,
    activeClass: 'bg-blue-600 text-white border-blue-600',
    inactiveClass: 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50',
    badgeClass: 'bg-blue-100 text-blue-700',
  },
  {
    value: 'delete',
    label: 'Delete',
    icon: IconTrash,
    activeClass: 'bg-red-600 text-white border-red-600',
    inactiveClass: 'bg-white text-red-700 border-red-300 hover:bg-red-50',
    badgeClass: 'bg-red-100 text-red-700',
  },
];

export const CheckCategoryFilter = () => {
  const { selectedFilter, setSelectedFilter, toCheckCategoriesData } =
    useCheckCategory();

  const getCount = (type: CategoryStatus) =>
    toCheckCategoriesData?.[type as 'create' | 'update' | 'delete']?.items
      ?.length ?? 0;

  return (
    <div className="flex gap-2">
      {FILTERS.map((filter) => {
        const isActive = selectedFilter === filter.value;
        const count = getCount(filter.value);
        const Icon = filter.icon;

        return (
          <button
            key={filter.value}
            onClick={() => setSelectedFilter(filter.value)}
            className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive ? filter.activeClass : filter.inactiveClass
            }`}
          >
            <Icon size={14} />
            {filter.label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                isActive ? 'bg-white/20 text-white' : filter.badgeClass
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
