import {
  EMAIL_LANE_OPTIONS,
  EMAIL_SUPPRESSION_REASON_OPTIONS,
} from '@/settings/email-addresses/constants';
import { EmailDeliveryChoiceFilter } from '@/settings/email-deliveries/components/filters/EmailDeliveryChoiceFilter';
import { IconBan, IconTargetArrow } from '@tabler/icons-react';
import { Combobox, Command, Filter, useMultiQueryState } from 'erxes-ui';

export const EmailAddressesFilterPopover = () => {
  const [queries] = useMultiQueryState<{
    lane: string;
    suppressionReason: string;
    searchValue: string;
  }>(['lane', 'suppressionReason', 'searchValue']);

  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );

  return (
    <>
      <Filter.Popover scope="email_addresses_page">
        <Filter.Trigger isFiltered={hasFilters} />
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput
                placeholder="Filter"
                variant="secondary"
                className="bg-background"
              />
              <Command.List className="p-1 max-h-none">
                <Filter.Item value="lane">
                  <IconTargetArrow />
                  Standing
                </Filter.Item>
                <Filter.Item value="suppressionReason">
                  <IconBan />
                  Closed for
                </Filter.Item>
                <Filter.SearchValueTrigger />
              </Command.List>
            </Command>
          </Filter.View>

          <Filter.View filterKey="lane">
            <EmailDeliveryChoiceFilter
              queryKey="lane"
              options={EMAIL_LANE_OPTIONS}
            />
          </Filter.View>
          <Filter.View filterKey="suppressionReason">
            <EmailDeliveryChoiceFilter
              queryKey="suppressionReason"
              options={EMAIL_SUPPRESSION_REASON_OPTIONS}
            />
          </Filter.View>
        </Combobox.Content>
      </Filter.Popover>

      <Filter.Dialog>
        <Filter.DialogStringView filterKey="searchValue" />
        <Filter.View filterKey="lane" inDialog>
          <EmailDeliveryChoiceFilter
            queryKey="lane"
            options={EMAIL_LANE_OPTIONS}
          />
        </Filter.View>
        <Filter.View filterKey="suppressionReason" inDialog>
          <EmailDeliveryChoiceFilter
            queryKey="suppressionReason"
            options={EMAIL_SUPPRESSION_REASON_OPTIONS}
          />
        </Filter.View>
      </Filter.Dialog>
    </>
  );
};
