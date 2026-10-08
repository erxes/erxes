import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('settings', { keyPrefix: 'email-deliveries' });
  const [status] = useFilterQueryState<string>('status');
  const [source] = useFilterQueryState<string>('source');
  const [provider] = useFilterQueryState<string>('provider');

  return (
    <>
      <Filter.BarItem queryKey="status">
        <Filter.BarName>
          <IconProgressCheck />
          {t('status')}
        </Filter.BarName>
        <Popover>
          <Popover.Trigger>
            <Filter.BarButton>{status || t('set-value')}</Filter.BarButton>
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
          {t('source')}
        </Filter.BarName>
        <Popover>
          <Popover.Trigger>
            <Filter.BarButton>{source || t('set-value')}</Filter.BarButton>
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
          {t('provider')}
        </Filter.BarName>
        <Popover>
          <Popover.Trigger>
            <Filter.BarButton>{provider || t('set-value')}</Filter.BarButton>
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
          {t('date')}
        </Filter.BarName>
        <Filter.Date filterKey="createdAt" />
      </Filter.BarItem>

      <EmailDeliveriesTotalCount />
    </>
  );
};
