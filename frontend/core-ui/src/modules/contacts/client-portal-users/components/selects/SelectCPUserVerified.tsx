import { IconRosetteDiscountCheck } from '@tabler/icons-react';
import { Filter } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  CPUserFilterOption,
  CPUserOptionFilterBar,
  CPUserOptionFilterView,
} from './CPUserOptionSelect';

const QUERY_KEY = 'isVerified';

const useCPUserVerifiedOptions = (): CPUserFilterOption[] => {
  const { t } = useTranslation('contact', { keyPrefix: 'clientPortalUser' });
  return [
    { value: 'verified', label: t('yes') },
    { value: 'unverified', label: t('no') },
  ];
};

const SelectCPUserVerifiedFilterItem = () => {
  const { t } = useTranslation('contact', { keyPrefix: 'clientPortalUser' });
  return (
    <Filter.Item value={QUERY_KEY}>
      <IconRosetteDiscountCheck />
      {t('verified')}
    </Filter.Item>
  );
};

const SelectCPUserVerifiedFilterView = () => (
  <CPUserOptionFilterView
    queryKey={QUERY_KEY}
    options={useCPUserVerifiedOptions()}
  />
);

const SelectCPUserVerifiedFilterBar = () => {
  const { t } = useTranslation('contact', { keyPrefix: 'clientPortalUser' });
  return (
    <CPUserOptionFilterBar
      queryKey={QUERY_KEY}
      label={t('verified')}
      Icon={IconRosetteDiscountCheck}
      options={useCPUserVerifiedOptions()}
    />
  );
};

export const SelectCPUserVerified = {
  FilterItem: SelectCPUserVerifiedFilterItem,
  FilterView: SelectCPUserVerifiedFilterView,
  FilterBar: SelectCPUserVerifiedFilterBar,
};
