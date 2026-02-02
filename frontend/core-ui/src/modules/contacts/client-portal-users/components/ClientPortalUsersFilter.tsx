import { IconSearch } from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  useFilterQueryState,
  useMultiQueryState,
} from 'erxes-ui';
import { ContactsHotKeyScope } from '@/contacts/types/ContactsHotKeyScope';
import { CP_USERS_CURSOR_SESSION_KEY } from '@/contacts/client-portal-users/constants/cpUsersCursorSessionKey';
import { ClientPortalUsersTotalCount } from '@/contacts/client-portal-users/components/ClientPortalUsersTotalCount';
import { useTranslation } from 'react-i18next';

const ClientPortalUsersFilterPopover = () => {
  const [queries] = useMultiQueryState<{
    searchValue: string;
    type: string;
    isVerified: string;
    clientPortalId: string;
  }>(['searchValue', 'type', 'isVerified', 'clientPortalId']);

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
                placeholder="Filter"
                variant="secondary"
                className="bg-background"
              />
              <Command.List className="p-1">
                <Filter.Item value="searchValue" inDialog>
                  <IconSearch />
                  {t('search')}
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

export const ClientPortalUsersFilter = () => {
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
        <Filter.BarItem queryKey="searchValue">
          <Filter.BarName>
            <IconSearch />
            Search
          </Filter.BarName>
          <Filter.BarButton filterKey="searchValue" inDialog>
            {searchValue}
          </Filter.BarButton>
        </Filter.BarItem>
        <ClientPortalUsersFilterPopover />
        <ClientPortalUsersTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
