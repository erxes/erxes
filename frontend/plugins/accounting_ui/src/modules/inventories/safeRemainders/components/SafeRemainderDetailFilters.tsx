import {
  IconLayoutGridAdd,
  IconSearch,
  IconToggleRightFilled,
  IconTypeface,
} from '@tabler/icons-react';
import { Combobox, Command, Filter, useMultiQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useSafeRemainderQueryParams } from '../hooks/useSafeRemainders';

const SafeRemainderDetailFilterPopover = () => {
  const { t } = useTranslation('accounting');
  const queryParams = useSafeRemainderQueryParams();
  const hasFilters = Object.values(queryParams || {}).some(
    (value) => value !== null,
  );

  return (
    <>
      <Filter.Popover scope="accounts-filter">
        <Filter.Trigger isFiltered={hasFilters} />
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput
                placeholder={t('filter')}
                variant="secondary"
                className="bg-background"
              />
              <Command.List className="p-1">
                <Filter.Item value="searchValue" inDialog>
                  <IconSearch />
                  {t('search')}
                </Filter.Item>
                <Filter.Item value="diffType" inDialog>
                  <IconTypeface />
                  {t('diff-type')}
                </Filter.Item>
                <Filter.Item value="category">
                  <IconLayoutGridAdd />
                  {t('category')}
                </Filter.Item>
                <Filter.Item value="status">
                  <IconToggleRightFilled />
                  {t('status')}
                </Filter.Item>
              </Command.List>
            </Command>
          </Filter.View>
        </Combobox.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <Filter.View filterKey="searchValue" inDialog>
          <Filter.DialogStringView filterKey="searchValue" />
        </Filter.View>
      </Filter.Dialog>
    </>
  );
};

export const SafeRemainderDetailFilter = ({
  afterBar,
}: {
  afterBar?: React.ReactNode;
}) => {
  const { t } = useTranslation('accounting');
  const [queries] = useMultiQueryState<{
    status: string;
    searchValue: string;
    productCategoryIds: string;
    diffType: string;
  }>(['status', 'searchValue', 'productCategoryIds', 'diffType']);

  const { status, searchValue, diffType } = queries;

  return (
    <Filter id="accounts-filter">
      <Filter.Bar>
        <Filter.BarItem queryKey="searchValue">
          <Filter.BarName>
            <IconSearch />
            {t('search')}
          </Filter.BarName>
          <Filter.BarButton filterKey="searchValue" inDialog>
            {searchValue}
          </Filter.BarButton>
        </Filter.BarItem>
        <Filter.BarItem queryKey="status">
          <Filter.BarName>
            <IconToggleRightFilled />
            {t('status')}
          </Filter.BarName>
          <Filter.BarButton filterKey="status" inDialog>
            {status}
          </Filter.BarButton>
        </Filter.BarItem>
        <Filter.BarItem queryKey="status">
          <Filter.BarName>
            <IconToggleRightFilled />
            {t('diff-type-label')}
          </Filter.BarName>
          <Filter.BarButton filterKey="diffType" inDialog>
            {diffType}
          </Filter.BarButton>
        </Filter.BarItem>
        <SafeRemainderDetailFilterPopover />
        {afterBar && <>{afterBar}</>}
      </Filter.Bar>
    </Filter>
  );
};
