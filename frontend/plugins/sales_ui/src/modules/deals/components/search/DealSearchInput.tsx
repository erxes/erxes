import {
  TDealSearchCategory,
  TDealTextSearches,
} from '@/deals/types/dealSearch';
import { getDealSearchDateLabel } from '@/deals/utils/dealSearch';
import { IconCalendar, IconSearch } from '@tabler/icons-react';
import {
  Button,
  DateRangeDialogContent,
  Dialog,
  Input,
  parseDateRangeFromString,
} from 'erxes-ui';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { useTranslation } from 'react-i18next';

type TDealSearchInputProps = {
  category: TDealSearchCategory;
  dateRange?: DateRange;
  placeholders: Record<TDealSearchCategory, string>;
  searches: TDealTextSearches;
  onDateRangeChange: (dateRange?: DateRange) => void;
  onSearchChange: (value: string) => void;
};

export const DealSearchInput = ({
  category,
  dateRange,
  placeholders,
  searches,
  onDateRangeChange,
  onSearchChange,
}: TDealSearchInputProps) => {
  const { t } = useTranslation('sales');
  const [dateDialogOpen, setDateDialogOpen] = useState(false);

  if (category !== 'date') {
    return (
      <div className="relative border-b">
        <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="h-10 rounded-none border-0 pl-9 shadow-none focus-visible:shadow-none focus-visible:ring-0 focus-visible:outline-none"
          type="search"
          placeholder={placeholders[category]}
          value={searches[category]}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
    );
  }

  return (
    <div className="border-b">
      <Dialog open={dateDialogOpen} onOpenChange={setDateDialogOpen}>
        <Dialog.Trigger asChild>
          <Button
            variant="ghost"
            className="h-10 w-full justify-start rounded-none px-3 font-normal text-muted-foreground hover:bg-transparent focus-visible:ring-0 focus-visible:outline-none"
          >
            <IconCalendar className="size-4" />
            {getDealSearchDateLabel(dateRange, placeholders.date)}
          </Button>
        </Dialog.Trigger>
        <DateRangeDialogContent
          label={t('date-created', 'Date created')}
          value={
            dateRange?.from
              ? `${dateRange.from.toISOString()},${(
                  dateRange.to ?? dateRange.from
                ).toISOString()}`
              : null
          }
          onApply={(value) => {
            onDateRangeChange(parseDateRangeFromString(value));
            setDateDialogOpen(false);
          }}
        />
      </Dialog>
    </div>
  );
};
