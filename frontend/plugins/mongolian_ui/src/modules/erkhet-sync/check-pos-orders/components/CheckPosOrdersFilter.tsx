import {
  IconKey,
  IconCashRegister,
  IconHash,
  IconCalendar,
  IconClock,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SelectMember } from 'ui-modules';
import { CheckPosOrdersHotKeyScope } from '../types/checkPosOrdersHotKeyScope';
import {
  useMultiQueryState,
  useFilterQueryState,
  Combobox,
  Command,
  Filter,
} from 'erxes-ui';
import { useCheckPosOrdersLeadSessionKey } from '../hooks/useCheckPosOrdersLeadSessionKey';
import { SelectPos } from './selects/SelectPos';
import { CheckPosOrdersTotalCount } from './CheckPosOrdersTotalCount';

export const CheckPosOrdersFilterPopover = () => {
  const [queries] = useMultiQueryState<{
    posToken: string;
    pos: string;
    user: string;
    number: string;
    paidDateRange: string;
    createdDateRange: string;
  }>([
    'posToken',
    'pos',
    'user',
    'number',
    'paidDateRange',
    'createdDateRange',
  ]);
  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );
  const { t } = useTranslation('mongolian');

  return (
    <>
      <Filter.Popover scope={CheckPosOrdersHotKeyScope.CheckPosOrdersPage}>
        <Filter.Trigger isFiltered={hasFilters}>{t('filter')}</Filter.Trigger>
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput
                placeholder={t('filter')}
                variant="secondary"
                className="bg-background"
              />
              <Command.List className="p-1">
                <Filter.Item value="posToken" inDialog>
                  <IconKey />
                  {t('pos-token')}
                </Filter.Item>
                <Filter.Item value="pos">
                  <IconCashRegister />
                  {t('pos')}
                </Filter.Item>
                <SelectMember.FilterItem value="user" label={t('assigned-to')} />
                <Command.Separator className="my-1" />
                <Filter.Item value="number" inDialog>
                  <IconHash />
                  {t('number')}
                </Filter.Item>
                <Filter.Item value="paidDateRange">
                  <IconCalendar />
                  {t('paid-date-range')}
                </Filter.Item>
                <Filter.Item value="createdDateRange">
                  <IconClock />
                  {t('created-date-range')}
                </Filter.Item>
              </Command.List>
            </Command>
          </Filter.View>
          <SelectMember.FilterView queryKey="user" />
          <SelectPos.FilterView />
          <Filter.View filterKey="paidDateRange">
            <Filter.DateView filterKey="paidDateRange" />
          </Filter.View>
          <Filter.View filterKey="createdDateRange">
            <Filter.DateView filterKey="createdDateRange" />
          </Filter.View>
        </Combobox.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <Filter.View filterKey="posToken" inDialog>
          <Filter.DialogStringView filterKey="posToken" />
        </Filter.View>
        <Filter.View filterKey="number" inDialog>
          <Filter.DialogStringView filterKey="number" />
        </Filter.View>
        <Filter.View filterKey="paidDateRange" inDialog>
          <Filter.DialogDateView filterKey="paidDateRange" />
        </Filter.View>
        <Filter.View filterKey="createdDateRange" inDialog>
          <Filter.DialogDateView filterKey="createdDateRange" />
        </Filter.View>
      </Filter.Dialog>
    </>
  );
};

export const CheckPosOrdersFilter = () => {
  const [posToken] = useFilterQueryState<string>('posToken');
  const [number] = useFilterQueryState<string>('number');
  const { sessionKey } = useCheckPosOrdersLeadSessionKey();
  const { t } = useTranslation('mongolian');
  return (
    <Filter id="check-pos-orders-filter" sessionKey={sessionKey}>
      <Filter.Bar>
        <CheckPosOrdersFilterPopover />
        <Filter.BarItem queryKey="posToken">
          <Filter.BarName>
            <IconKey />
            {t('pos-token')}
          </Filter.BarName>
          <Filter.BarButton filterKey="posToken" inDialog>
            {posToken}
          </Filter.BarButton>
        </Filter.BarItem>
        <Filter.BarItem queryKey="number">
          <Filter.BarName>
            <IconHash />
            {t('number')}
          </Filter.BarName>
          <Filter.BarButton filterKey="number" inDialog>
            {number}
          </Filter.BarButton>
        </Filter.BarItem>
        <Filter.BarItem queryKey="paidDateRange">
          <Filter.BarName>
            <IconCalendar />
            {t('paid-date-range')}
          </Filter.BarName>
          <Filter.Date filterKey="paidDateRange" />
        </Filter.BarItem>
        <Filter.BarItem queryKey="createdDateRange">
          <Filter.BarName>
            <IconClock />
            {t('created-date-range')}
          </Filter.BarName>
          <Filter.Date filterKey="createdDateRange" />
        </Filter.BarItem>
        <SelectPos.FilterBar />
        <SelectMember.FilterBar queryKey="user" label={t('assigned-to')} />
        <CheckPosOrdersTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
