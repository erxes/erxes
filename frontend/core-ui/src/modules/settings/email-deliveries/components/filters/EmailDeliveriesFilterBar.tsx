import {
  EMAIL_DELIVERY_PROVIDER_OPTIONS,
  EMAIL_DELIVERY_SOURCE_OPTIONS,
  EMAIL_DELIVERY_STATUS_OPTIONS,
} from '@/settings/email-deliveries/constants';
import { EmailDeliveriesTotalCount } from '@/settings/email-deliveries/components/EmailDeliveriesTotalCount';
import { EmailDeliveryChoiceFilter } from '@/settings/email-deliveries/components/filters/EmailDeliveryChoiceFilter';
import {
  IconCalendarPlus,
  IconProgressCheck,
  IconSend,
  IconSourceCode,
} from '@tabler/icons-react';
import { Combobox, Filter, Popover, useFilterQueryState } from 'erxes-ui';

export const EmailDeliveriesFilterBar = () => {
  const [status] = useFilterQueryState<string>('status');
  const [source] = useFilterQueryState<string>('source');
  const [provider] = useFilterQueryState<string>('provider');

  return (
    <>
      <Filter.BarItem queryKey="status">
        <Filter.BarName>
          <IconProgressCheck />
          Status
        </Filter.BarName>
        <Popover>
          <Popover.Trigger>
            <Filter.BarButton>{status || 'Set value'}</Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <EmailDeliveryChoiceFilter
              queryKey="status"
              options={EMAIL_DELIVERY_STATUS_OPTIONS}
            />
          </Combobox.Content>
        </Popover>
      </Filter.BarItem>

      <Filter.BarItem queryKey="source">
        <Filter.BarName>
          <IconSourceCode />
          Source
        </Filter.BarName>
        <Popover>
          <Popover.Trigger>
            <Filter.BarButton>{source || 'Set value'}</Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <EmailDeliveryChoiceFilter
              queryKey="source"
              options={EMAIL_DELIVERY_SOURCE_OPTIONS}
            />
          </Combobox.Content>
        </Popover>
      </Filter.BarItem>

      <Filter.BarItem queryKey="provider">
        <Filter.BarName>
          <IconSend />
          Provider
        </Filter.BarName>
        <Popover>
          <Popover.Trigger>
            <Filter.BarButton>{provider || 'Set value'}</Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <EmailDeliveryChoiceFilter
              queryKey="provider"
              options={EMAIL_DELIVERY_PROVIDER_OPTIONS}
            />
          </Combobox.Content>
        </Popover>
      </Filter.BarItem>

      <Filter.SearchValueBarItem />

      <Filter.BarItem queryKey="createdAt">
        <Filter.BarName>
          <IconCalendarPlus />
          Date
        </Filter.BarName>
        <Filter.Date filterKey="createdAt" />
      </Filter.BarItem>

      <EmailDeliveriesTotalCount />
    </>
  );
};
