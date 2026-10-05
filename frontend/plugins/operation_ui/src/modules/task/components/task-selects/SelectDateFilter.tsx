import { Filter } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

const createDateFilter = (filterKey: string, labelKey: string) => {
  const FilterView = () => {
    const { t } = useTranslation('operation');

    return (
      <Filter.View filterKey={filterKey}>
        <Filter.DateView filterKey={filterKey} label={t(labelKey)} />
      </Filter.View>
    );
  };

  const FilterBar = () => {
    const { t } = useTranslation('operation');
    return <Filter.Date filterKey={filterKey} label={t(labelKey)} />;
  };

  const FilterDialog = () => {
    const { t } = useTranslation('operation');

    return (
      <Filter.View filterKey={filterKey} inDialog>
        <Filter.DialogDateView filterKey={filterKey} label={t(labelKey)} />
      </Filter.View>
    );
  };

  return { FilterView, FilterBar, FilterDialog };
};

export const SelectDueDateFilter = createDateFilter(
  'targetDateStartDate',
  'due-date',
);
export const SelectCreatedDateFilter = createDateFilter(
  'createdStartDate',
  'created',
);
export const SelectUpdatedDateFilter = createDateFilter(
  'updatedStartDate',
  'updated',
);
export const SelectStartedDateFilter = createDateFilter(
  'startDateStartDate',
  'started',
);
export const SelectCompletedDateFilter = createDateFilter(
  'completedStartDate',
  'completed',
);
