import {
  Combobox,
  Command,
  Filter,
  useFilterQueryState,
  useMultiQueryState,
} from 'erxes-ui';
import { IconCalendarPlus, IconSearch } from '@tabler/icons-react';

import { CP_USERS_CURSOR_SESSION_KEY } from '@/contacts/client-portal-users/constants/cpUsersCursorSessionKey';
import { ClientPortalUsersTotalCount } from '@/contacts/client-portal-users/components/ClientPortalUsersTotalCount';
import { ContactsHotKeyScope } from '@/contacts/types/ContactsHotKeyScope';
import { SelectCPUserType } from '@/contacts/client-portal-users/components/selects/SelectCPUserType';
import { SelectCPUserVerified } from '@/contacts/client-portal-users/components/selects/SelectCPUserVerified';
import { SelectClientPortal } from 'ui-modules';
import { useTranslation } from 'react-i18next';

const ClientPortalUsersFilterPopover = () => {
  const [queries] = useMultiQueryState<{
    searchValue: string;
    type: string;
    isVerified: string;
    clientPortalId: string;
    created: string;
  }>(['searchValue', 'type', 'isVerified', 'clientPortalId', 'created']);

  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null && value !== '',
  );
  const { t } = useTranslation('contact', {
    keyPrefix: 'filter',
  });

  return (
    <>
      <Filter.Popover scope={ContactsHotKeyScope.ClientPortalUsersPage}>
        <Filter.Trigger isFiltered={hasFilters} />
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput
                placeholder={t('_')}
                variant="secondary"
                className="bg-background"
              />
              <Command.List className="p-1">
                <Filter.Item value="searchValue" inDialog>
                  <IconSearch />
                  {t('search')}
                </Filter.Item>
                <SelectClientPortal.FilterItem />
                <SelectCPUserType.FilterItem />
                <SelectCPUserVerified.FilterItem />
                <Command.Separator className="my-1" />
                <Filter.Item value="created">
                  <IconCalendarPlus />
                  {t('created-at')}
                </Filter.Item>
              </Command.List>
            </Command>
          </Filter.View>
          <SelectClientPortal.FilterView />
          <SelectCPUserType.FilterView />
          <SelectCPUserVerified.FilterView />
          <Filter.View filterKey="created">
            <Filter.DateView filterKey="created" />
          </Filter.View>
        </Combobox.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <Filter.View filterKey="searchValue" inDialog>
          <Filter.DialogStringView filterKey="searchValue" />
        </Filter.View>
        <Filter.View filterKey="created" inDialog>
          <Filter.DialogDateView filterKey="created" />
        </Filter.View>
      </Filter.Dialog>
    </>
  );
};

export const ClientPortalUsersFilter = () => {
  const { t } = useTranslation('contact', { keyPrefix: 'filter' });
  const [searchValue] = useFilterQueryState<string>(
    'searchValue',
    CP_USERS_CURSOR_SESSION_KEY,
  );

  return (
    <Filter
      id="client-portal-users-filter"
      sessionKey={CP_USERS_CURSOR_SESSION_KEY}
    >
      <Filter.Bar>
        <ClientPortalUsersFilterPopover />
        <Filter.BarItem queryKey="searchValue">
          <Filter.BarName>
            <IconSearch />
            {t('search')}
          </Filter.BarName>
          <Filter.BarButton filterKey="searchValue" inDialog>
            {searchValue}
          </Filter.BarButton>
        </Filter.BarItem>
        <SelectClientPortal.FilterBar />
        <SelectCPUserType.FilterBar />
        <SelectCPUserVerified.FilterBar />
        <Filter.BarItem queryKey="created">
          <Filter.BarName>
            <IconCalendarPlus />
            {t('created-at')}
          </Filter.BarName>
          <Filter.Date filterKey="created" />
        </Filter.BarItem>
        <ClientPortalUsersFilterPopover />
        <ClientPortalUsersTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
