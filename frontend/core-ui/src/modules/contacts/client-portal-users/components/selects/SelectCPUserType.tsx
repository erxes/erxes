import { IconUser } from '@tabler/icons-react';
import { Filter } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  CPUserFilterOption,
  CPUserOptionFilterBar,
  CPUserOptionFilterView,
} from './CPUserOptionSelect';

const QUERY_KEY = 'type';

const useCPUserTypeOptions = (): CPUserFilterOption[] => {
  const { t } = useTranslation('contact', { keyPrefix: 'clientPortalUser' });
  return [
    { value: 'customer', label: t('detail.customer') },
    { value: 'company', label: t('detail.company') },
  ];
};

const SelectCPUserTypeFilterItem = () => {
  const { t } = useTranslation('contact', { keyPrefix: 'clientPortalUser' });
  return (
    <Filter.Item value={QUERY_KEY}>
      <IconUser />
      {t('type')}
    </Filter.Item>
  );
};

const SelectCPUserTypeFilterView = () => (
  <CPUserOptionFilterView
    queryKey={QUERY_KEY}
    options={useCPUserTypeOptions()}
  />
);

const SelectCPUserTypeFilterBar = () => {
  const { t } = useTranslation('contact', { keyPrefix: 'clientPortalUser' });
  return (
    <CPUserOptionFilterBar
      queryKey={QUERY_KEY}
      label={t('type')}
      Icon={IconUser}
      options={useCPUserTypeOptions()}
    />
  );
};

export const SelectCPUserType = {
  FilterItem: SelectCPUserTypeFilterItem,
  FilterView: SelectCPUserTypeFilterView,
  FilterBar: SelectCPUserTypeFilterBar,
};
