import { NotificationFilterMenu } from '@/notification/components/filter/NotificationFilterMenu';
import { NotificationFilterViews } from '@/notification/components/filter/NotificationFilterViews';
import { MyInboxHotkeyScope } from '@/notification/types/notifications';
import { Combobox, Filter } from 'erxes-ui';

export const NotificationsFilters = () => {
  return (
    <Filter id={MyInboxHotkeyScope.MainPage}>
      <Filter.Popover scope={MyInboxHotkeyScope.MainPage}>
        <Filter.Trigger isFiltered />
        <Combobox.Content>
          <NotificationFilterMenu />
          <NotificationFilterViews />
        </Combobox.Content>
      </Filter.Popover>
      <NotificationFilterDialogs />
    </Filter>
  );
};

const NotificationFilterDialogs = () => {
  return (
    <Filter.Dialog>
      <Filter.View filterKey="createdAt" inDialog>
        <Filter.DialogDateView filterKey="createdAt" />
      </Filter.View>
    </Filter.Dialog>
  );
};
