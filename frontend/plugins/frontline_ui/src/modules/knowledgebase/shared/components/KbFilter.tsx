import { IconSearch } from '@tabler/icons-react';
import { Combobox, Command, Filter } from 'erxes-ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export const hasActiveFilters = (queries?: Record<string, unknown> | null) =>
  Object.values(queries || {}).some((value) => value !== null);

export const KbFilterPopover = ({
  scope,
  isFiltered,
  items,
  views,
}: {
  scope: string;
  isFiltered: boolean;
  items?: ReactNode;
  views?: ReactNode;
}) => {
  const { t } = useTranslation('frontline');

  return (
    <Filter.Popover scope={scope}>
      <Filter.Trigger isFiltered={isFiltered} />
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
              {items}
            </Command.List>
          </Command>
        </Filter.View>
        {views}
      </Combobox.Content>
    </Filter.Popover>
  );
};

export const KbSearchFilterBar = ({
  searchValue,
}: {
  searchValue?: string | null;
}) => {
  const { t } = useTranslation('frontline');

  return (
    <>
      {searchValue ? (
        <Filter.BarItem queryKey="searchValue">
          <Filter.BarName>
            <IconSearch />
            {t('search')}
          </Filter.BarName>
          <Filter.BarButton filterKey="searchValue" inDialog>
            {searchValue}
          </Filter.BarButton>
        </Filter.BarItem>
      ) : null}
      <Filter.Dialog>
        <Filter.View filterKey="searchValue" inDialog>
          <Filter.DialogStringView filterKey="searchValue" />
        </Filter.View>
      </Filter.Dialog>
    </>
  );
};
