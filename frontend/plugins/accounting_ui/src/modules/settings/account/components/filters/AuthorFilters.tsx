import { useTranslation } from 'react-i18next';
import { SelectMember } from 'ui-modules';

export const FilterPopoverAuthorItems = () => {
  const { t } = useTranslation('accounting');
  return (
    <>
      <SelectMember.FilterItem value="createdUserId" label={t('created-by')} />
      <SelectMember.FilterItem
        value="modifiedUserId"
        label={t('modified-by')}
      />
    </>
  );
};

export const FilterAuthorViews = () => (
  <>
    <SelectMember.FilterView mode="single" queryKey="createdUserId" />
    <SelectMember.FilterView mode="single" queryKey="modifiedUserId" />
  </>
);

export const FilterBarAuthors = () => {
  const { t } = useTranslation('accounting');
  return (
    <>
      <SelectMember.FilterBar
        queryKey="createdUserId"
        label={t('created-by')}
        mode="single"
      />
      <SelectMember.FilterBar
        queryKey="modifiedUserId"
        label={t('modified-by')}
        mode="single"
      />
    </>
  );
};
