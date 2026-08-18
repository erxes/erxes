import { Combobox, Command, Filter } from 'erxes-ui';
import { IconCheck } from '@tabler/icons-react';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

import {
  getReportDateFilterAtom,
  getReportFacebookPageFilterAtom,
} from '@/report/states';
import { useFacebookPages } from '@/report/hooks/useFacebookReport';
import { FacebookPage } from '@/report/types';
import { DateView, ReportDateFilterView } from './report-filter';

interface FacebookReportFilterProps {
  cardId: string;
}

export const FacebookReportFilter = ({ cardId }: FacebookReportFilterProps) => {
  const { t } = useTranslation('frontline');
  const [dateValue, setDateValue] = useAtom(getReportDateFilterAtom(cardId));
  const [pageFilter, setPageFilter] = useAtom(
    getReportFacebookPageFilterAtom(cardId),
  );
  const { facebookPages } = useFacebookPages();

  const hasFilters = Boolean(dateValue) || pageFilter.length > 0;

  const handleClear = () => {
    setDateValue('');
    setPageFilter([]);
  };

  return (
    <Filter
      id={`facebook-report-filter-${cardId}`}
      sessionKey={`facebook-report-filter-${cardId}`}
    >
      <Filter.Popover scope={`facebook-report-filter-${cardId}`}>
        <Filter.Trigger isFiltered={hasFilters} />
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Command.List>
                <Filter.Item value="page">{t('facebook-page')}</Filter.Item>
                <Filter.Item value="date">{t('date')}</Filter.Item>
                {hasFilters && (
                  <>
                    <Command.Separator />
                    <Command.Item
                      value="clear"
                      onSelect={handleClear}
                      className="text-destructive"
                    >
                      {t('clear-all')}
                    </Command.Item>
                  </>
                )}
              </Command.List>
            </Command>
          </Filter.View>
          <Filter.View filterKey="page">
            <Command shouldFilter={false}>
              <PageFilterView
                value={pageFilter}
                onValueChange={setPageFilter}
                pages={facebookPages || []}
              />
            </Command>
          </Filter.View>
          <Filter.View filterKey="date">
            <DateView
              filterKey="date"
              selected={dateValue}
              onSelect={setDateValue}
            />
          </Filter.View>
        </Combobox.Content>
      </Filter.Popover>
      <ReportDateFilterView value={dateValue} onChange={setDateValue} />
    </Filter>
  );
};

const PageFilterView = ({
  value,
  onValueChange,
  pages,
}: {
  value: string[];
  onValueChange: (value: string[]) => void;
  pages: FacebookPage[];
}) => {
  const { t } = useTranslation('frontline');

  const handleSelect = (selectedValue: string) => {
    if (selectedValue === 'all') {
      onValueChange([]);
      return;
    }

    onValueChange(
      value.includes(selectedValue)
        ? value.filter((pageId) => pageId !== selectedValue)
        : [...value, selectedValue],
    );
  };

  return (
    <Command.List className="max-h-[500px] overflow-y-auto">
      <Command.Item value="all" onSelect={() => handleSelect('all')}>
        <div className="flex items-center gap-2">
          {value.length === 0 && <IconCheck className="size-4" />}
          <span>{t('all-facebook-pages')}</span>
        </div>
      </Command.Item>
      {pages.map((page) => (
        <Command.Item
          key={page._id}
          value={page._id}
          onSelect={() => handleSelect(page._id)}
        >
          <div className="flex items-center gap-2">
            {value.includes(page._id) && <IconCheck className="size-4" />}
            <span>{page.name}</span>
          </div>
        </Command.Item>
      ))}
    </Command.List>
  );
};
