import { useTranslation } from 'react-i18next';
import { EmailDeliveryChoiceFilter } from '@/settings/email-deliveries/components/filters/EmailDeliveryChoiceFilter';
import {
  EMAIL_DELIVERY_PROVIDER_OPTIONS,
  EMAIL_DELIVERY_SOURCE_OPTIONS,
  EMAIL_DELIVERY_STATUS_OPTIONS,
} from '@/settings/email-deliveries/constants';
import {
  IconCalendarPlus,
  IconProgressCheck,
  IconSend,
  IconSourceCode,
} from '@tabler/icons-react';
import { Combobox, Command, Filter, useMultiQueryState } from 'erxes-ui';

export const EmailDeliveriesFilterPopover = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'email-deliveries' });
  const [queries] = useMultiQueryState<{
    status: string;
    source: string;
    provider: string;
    searchValue: string;
    createdAt: string;
  }>(['status', 'source', 'provider', 'searchValue', 'createdAt']);

  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );

  return (
    <>
      <Filter.Popover scope="email_deliveries_page">
        <Filter.Trigger isFiltered={hasFilters} />
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput
                placeholder={t('filter')}
                variant="secondary"
                className="bg-background"
              />
              <Command.List className="p-1 max-h-none">
                <Filter.Item value="status">
                  <IconProgressCheck />
                  {t('status')}
                </Filter.Item>
                <Filter.Item value="source">
                  <IconSourceCode />
                  {t('source')}
                </Filter.Item>
                <Filter.Item value="provider">
                  <IconSend />
                  {t('provider')}
                </Filter.Item>
                <Filter.SearchValueTrigger />
                <Command.Separator className="my-1" />
                <Filter.Item value="createdAt">
                  <IconCalendarPlus />
                  {t('date')}
                </Filter.Item>
              </Command.List>
            </Command>
          </Filter.View>

          <Filter.View filterKey="status">
            <EmailDeliveryChoiceFilter
              queryKey="status"
              options={EMAIL_DELIVERY_STATUS_OPTIONS}
            />
          </Filter.View>
          <Filter.View filterKey="source">
            <EmailDeliveryChoiceFilter
              queryKey="source"
              options={EMAIL_DELIVERY_SOURCE_OPTIONS}
            />
          </Filter.View>
          <Filter.View filterKey="provider">
            <EmailDeliveryChoiceFilter
              queryKey="provider"
              options={EMAIL_DELIVERY_PROVIDER_OPTIONS}
            />
          </Filter.View>
          <Filter.View filterKey="createdAt">
            <Filter.DateView filterKey="createdAt" />
          </Filter.View>
        </Combobox.Content>
      </Filter.Popover>

      <Filter.Dialog>
        <Filter.DialogStringView filterKey="searchValue" />
        <Filter.View filterKey="status" inDialog>
          <EmailDeliveryChoiceFilter
            queryKey="status"
            options={EMAIL_DELIVERY_STATUS_OPTIONS}
          />
        </Filter.View>
        <Filter.View filterKey="source" inDialog>
          <EmailDeliveryChoiceFilter
            queryKey="source"
            options={EMAIL_DELIVERY_SOURCE_OPTIONS}
          />
        </Filter.View>
        <Filter.View filterKey="provider" inDialog>
          <EmailDeliveryChoiceFilter
            queryKey="provider"
            options={EMAIL_DELIVERY_PROVIDER_OPTIONS}
          />
        </Filter.View>
        <Filter.View filterKey="createdAt" inDialog>
          <Filter.DialogDateView filterKey="createdAt" />
        </Filter.View>
      </Filter.Dialog>
    </>
  );
};
