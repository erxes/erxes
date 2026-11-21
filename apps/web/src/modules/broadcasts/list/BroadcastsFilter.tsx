import { BroadcastChannel, BroadcastStatus } from '@erxes/core-contract';
import { IconProgress, IconSpeakerphone } from '@tabler/icons-react';
import {
  Combobox,
  Command,
  DisplayMenu,
  Filter,
  PageSubHeader,
  Skeleton,
  useFormat,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { OptionFilter, type OptionFilterProps } from '~/components/OptionFilter';
import { BroadcastDateFilter } from './BroadcastDateFilter';
import { BROADCASTS_DISPLAY, useBroadcasts, useBroadcastsDisplay } from './useBroadcastsList';

/** The status and channel filters, labelled in the member's language. */
const useOptionFilters = (): OptionFilterProps[] => {
  const { t } = useTranslation('broadcasts');

  return [
    {
      filterKey: 'status',
      label: t('status-filter', 'Status'),
      icon: IconProgress,
      options: BroadcastStatus.options.map((value) => ({
        value,
        label: t(`status.${value}`, value),
      })),
    },
    {
      filterKey: 'channel',
      label: t('channel-filter', 'Channel'),
      icon: IconSpeakerphone,
      options: BroadcastChannel.options.map((value) => ({
        value,
        label: t(`channel.${value}`, value),
      })),
    },
  ];
};

/** How many broadcasts the table's filters match. */
const BroadcastsCount = () => {
  const { t } = useTranslation('broadcasts');
  const fmt = useFormat();
  const { totalCount, loading } = useBroadcasts();

  return (
    <div className="h-7 whitespace-nowrap text-sm font-medium leading-7 text-muted-foreground">
      {totalCount !== undefined
        ? t('list.count', '{{formatted}} broadcasts', {
            count: totalCount,
            formatted: fmt.number(totalCount),
          })
        : loading && <Skeleton className="mt-1.5 inline-block h-4 w-20" />}
    </div>
  );
};

/** Search, status, channel and (in the table) the day it goes out; the count; table or calendar. */
export const BroadcastsFilter = () => {
  const { t } = useTranslation('broadcasts');
  const options = useOptionFilters();
  const { display, displays } = useBroadcastsDisplay();
  const table = display === 'table';

  return (
    <PageSubHeader>
      <Filter id="broadcasts">
        <Filter.Bar>
          <Filter.Popover>
            <Filter.Trigger />
            <Combobox.Content>
              <Filter.View>
                <Command>
                  <Filter.CommandInput
                    placeholder={t('list.filter', 'Filter')}
                    variant="secondary"
                  />
                  <Command.List>
                    <Filter.SearchValueTrigger />
                    {options.map((option) => (
                      <OptionFilter.Item key={option.filterKey} {...option} />
                    ))}
                    {table && <BroadcastDateFilter.Item />}
                  </Command.List>
                </Command>
              </Filter.View>
              {options.map((option) => (
                <OptionFilter.View key={option.filterKey} {...option} />
              ))}
              {table && <BroadcastDateFilter.View />}
            </Combobox.Content>
          </Filter.Popover>

          <Filter.Dialog>
            <Filter.View filterKey="searchValue" inDialog>
              <Filter.DialogStringView filterKey="searchValue" />
            </Filter.View>
          </Filter.Dialog>

          <Filter.SearchValueBarItem />
          {options.map((option) => (
            <OptionFilter.Bar key={option.filterKey} {...option} />
          ))}
          {table && <BroadcastDateFilter.Bar />}
          {table && <BroadcastsCount />}

          <div className="ml-auto">
            <DisplayMenu list={BROADCASTS_DISPLAY} displays={displays} />
          </div>
        </Filter.Bar>
      </Filter>
    </PageSubHeader>
  );
};
