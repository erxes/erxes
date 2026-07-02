import { IconCalendarPlus } from '@tabler/icons-react';

import { Combobox, Command, Filter, useMultiQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

import { useDuplicatedLeadSessionKey } from '~/modules/ebarimt/put-response/put-responses-duplicated/hooks/useDuplicatedLeadSessionKey';
import { DuplicatedHotKeyScope } from '~/modules/ebarimt/put-response/put-responses-duplicated/types/path/DuplicatedHotKeyScope';
import { DuplicatedTotalCount } from '~/modules/ebarimt/put-response/put-responses-duplicated/components/DuplicatedTotalCount';
import { SelectBillType } from '~/modules/ebarimt/put-response/put-responses-duplicated/components/selects/SelectBillType';

const DuplicatedFilterPopover = () => {
  const { t } = useTranslation('mongolian');
  const [queries] = useMultiQueryState<{
    dateRange: string;
    billType: string;
  }>(['dateRange', 'billType']);

  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );

  return (
    <>
      <Filter.Popover scope={DuplicatedHotKeyScope.DuplicatedPage}>
        <Filter.Trigger isFiltered={hasFilters} />
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput
                placeholder={t('filter')}
                variant="secondary"
                className="bg-background"
              />
              <Command.List className="p-1">
                <SelectBillType.FilterItem />
                <Filter.Item value="dateRange">
                  <IconCalendarPlus />
                  {t('date-range')}
                </Filter.Item>
              </Command.List>
            </Command>
          </Filter.View>
          <SelectBillType.FilterView />
          <Filter.View filterKey="dateRange">
            <Filter.DateView filterKey="dateRange" />
          </Filter.View>
        </Combobox.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <Filter.View filterKey="billType" inDialog>
          <SelectBillType.FilterView />
        </Filter.View>
        <Filter.View filterKey="dateRange" inDialog>
          <Filter.DialogDateView filterKey="dateRange" />
        </Filter.View>
      </Filter.Dialog>
    </>
  );
};

export const DuplicatedFilter = () => {
  const { t } = useTranslation('mongolian');
  const { sessionKey } = useDuplicatedLeadSessionKey();

  return (
    <Filter id="duplicated-filter" sessionKey={sessionKey}>
      <Filter.Bar>
        <DuplicatedFilterPopover />
        <SelectBillType.FilterBar />
        <Filter.BarItem queryKey="dateRange">
          <Filter.BarName>
            <IconCalendarPlus />
            {t('date-range')}
          </Filter.BarName>
          <Filter.Date filterKey="dateRange" />
        </Filter.BarItem>

        <DuplicatedTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
