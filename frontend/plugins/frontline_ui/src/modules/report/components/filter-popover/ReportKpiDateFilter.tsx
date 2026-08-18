import { Combobox, Command, Filter } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

import { getReportDateFilterAtom } from '@/report/states';
import { DateView, ReportDateFilterView } from './report-filter';

export const OVERVIEW_KPI_DATE_FILTER_ID = 'overview-kpi-date';
export const TICKET_PRIORITY_DATE_FILTER_ID = 'ticket-priority-date';

interface ReportKpiDateFilterProps {
  filterId: string;
}

export const ReportKpiDateFilter = ({ filterId }: ReportKpiDateFilterProps) => {
  const { t } = useTranslation('frontline');
  const [value, onChange] = useAtom(getReportDateFilterAtom(filterId));

  return (
    <Filter id={filterId} sessionKey={filterId}>
      <Filter.Popover scope={filterId}>
        <Filter.Trigger isFiltered={Boolean(value)} />
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Command.List>
                <Filter.Item value="date">{t('date')}</Filter.Item>
                {value && (
                  <>
                    <Command.Separator />
                    <Command.Item
                      value="clear"
                      onSelect={() => onChange('')}
                      className="text-destructive"
                    >
                      {t('clear-all')}
                    </Command.Item>
                  </>
                )}
              </Command.List>
            </Command>
          </Filter.View>
          <Filter.View filterKey="date">
            <DateView filterKey="date" selected={value} onSelect={onChange} />
          </Filter.View>
        </Combobox.Content>
      </Filter.Popover>
      <ReportDateFilterView value={value} onChange={onChange} />
    </Filter>
  );
};
