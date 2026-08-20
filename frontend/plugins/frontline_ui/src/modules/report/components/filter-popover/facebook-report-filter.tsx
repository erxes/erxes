import {
  Button,
  Combobox,
  Command,
  Dialog,
  Filter,
  Input,
  useFilterContext,
} from 'erxes-ui';
import { IconCheck, IconSearch } from '@tabler/icons-react';
import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  getReportDateFilterAtom,
  getReportFacebookPageFilterAtom,
  getReportFacebookSearchFilterAtom,
} from '@/report/states';
import { useFacebookPages } from '@/report/hooks/useFacebookReport';
import { FacebookPage } from '@/report/types';
import { DateView } from './report-filter';
import { ReportDateFilter } from './ReportDateFilter';

interface FacebookReportFilterProps {
  cardId: string;
  showSearch?: boolean;
}

export const FacebookReportFilter = ({
  cardId,
  showSearch,
}: FacebookReportFilterProps) => {
  const { t } = useTranslation('frontline');
  const [dateValue, setDateValue] = useAtom(getReportDateFilterAtom(cardId));
  const [pageFilter, setPageFilter] = useAtom(
    getReportFacebookPageFilterAtom(cardId),
  );
  const [searchValue, setSearchValue] = useAtom(
    getReportFacebookSearchFilterAtom(cardId),
  );
  const { facebookPages } = useFacebookPages();

  const hasFilters =
    Boolean(dateValue) ||
    pageFilter.length > 0 ||
    Boolean(showSearch && searchValue);

  const handleClear = () => {
    setDateValue('');
    setPageFilter([]);
    setSearchValue('');
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
                {showSearch && (
                  <Filter.Item value="search" inDialog>
                    <IconSearch />
                    {t('search')}
                  </Filter.Item>
                )}
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
      <Filter.Dialog>
        <Filter.View filterKey="date" inDialog>
          <ReportDateFilter value={dateValue} onChange={setDateValue} />
        </Filter.View>
        {showSearch && (
          <Filter.View filterKey="search" inDialog>
            <PostSearchDialog value={searchValue} onChange={setSearchValue} />
          </Filter.View>
        )}
      </Filter.Dialog>
    </Filter>
  );
};

const PostSearchDialog = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const { t } = useTranslation('frontline');
  const { setDialogView, setOpenDialog } = useFilterContext();
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  return (
    <Dialog.Content>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onChange(draft.trim());
          setDialogView('root');
          setOpenDialog(false);
        }}
      >
        <Dialog.Header>
          <Dialog.Title className="font-medium text-lg">
            {t('search-posts-title')}
          </Dialog.Title>
        </Dialog.Header>
        <Input
          placeholder={t('search-posts-placeholder')}
          className="my-4"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <Dialog.Footer className="sm:space-x-3">
          <Dialog.Close asChild>
            <Button variant="outline" size="lg">
              {t('cancel')}
            </Button>
          </Dialog.Close>
          <Button size="lg" type="submit">
            {t('apply')}
          </Button>
        </Dialog.Footer>
      </form>
    </Dialog.Content>
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
