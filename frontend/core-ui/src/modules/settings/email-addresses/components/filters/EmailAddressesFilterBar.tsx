import { useTranslation } from 'react-i18next';
import { EmailAddressesTotalCount } from '@/settings/email-addresses/components/EmailAddressesTotalCount';
import {
  EMAIL_LANE_OPTIONS,
  EMAIL_SUPPRESSION_REASON_OPTIONS,
} from '@/settings/email-addresses/constants';
import { EmailDeliveryChoiceFilter } from '@/settings/email-deliveries/components/filters/EmailDeliveryChoiceFilter';
import { IconBan, IconTargetArrow } from '@tabler/icons-react';
import { Combobox, Filter, Popover, useFilterQueryState } from 'erxes-ui';

export const EmailAddressesFilterBar = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'email-addresses' });
  const [lane] = useFilterQueryState<string>('lane');
  const [reason] = useFilterQueryState<string>('suppressionReason');

  return (
    <>
      <Filter.BarItem queryKey="lane">
        <Filter.BarName>
          <IconTargetArrow />
          {t('standing')}
        </Filter.BarName>
        <Popover>
          <Popover.Trigger>
            <Filter.BarButton>{lane || t('set-value')}</Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <EmailDeliveryChoiceFilter
              queryKey="lane"
              options={EMAIL_LANE_OPTIONS}
            />
          </Combobox.Content>
        </Popover>
      </Filter.BarItem>

      <Filter.BarItem queryKey="suppressionReason">
        <Filter.BarName>
          <IconBan />
          {t('closed-for')}
        </Filter.BarName>
        <Popover>
          <Popover.Trigger>
            <Filter.BarButton>{reason || t('set-value')}</Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <EmailDeliveryChoiceFilter
              queryKey="suppressionReason"
              options={EMAIL_SUPPRESSION_REASON_OPTIONS}
            />
          </Combobox.Content>
        </Popover>
      </Filter.BarItem>

      <Filter.SearchValueBarItem />

      <EmailAddressesTotalCount />
    </>
  );
};
