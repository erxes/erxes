import {
  FilterBar,
  FilterBarButton,
  FilterBarCloseButton,
  FilterBarItem,
  FilterBarName,
  FilterSearchValueBarItem,
} from './FilterBar';
import { FilterDialog, FilterDialogStringView } from './FilterDialog';
import {
  FilterCommandInput,
  FilterCommandItem,
  FilterItem,
  FilterPopover,
  FilterSearchValueTrigger,
  FilterTrigger,
  FilterView,
} from './FilterPopover';
import { FilterProvider } from './FilterProvider';
import { onDemand } from 'erxes-ui/components/on-demand';

// The date filter's parts load on first use: only some lists filter by date this way.
const dateFilter = () => import('../date-filter/FilterDate');

const FilterDialogDateView = onDemand(
  async () => (await import('../date-filter/DateRangeDialog')).FilterDialogDateView,
);

const FilterPopoverDateView = onDemand(async () => (await dateFilter()).FilterPopoverDateView);
const FilterBarDate = onDemand(async () => (await dateFilter()).FilterBarDate);

/**
 * Parts of a filter popover and bar, for a page without saved views.
 * A list page uses `ListFilter`; reach for these parts only for a filter it can't draw. A date
 * filter is `DateView` in the popover, `DialogDateView` in the dialog and `Date` on its bar
 * chip; `parseDateRangeFromString` reads its value.
 */
export const Filter = Object.assign(FilterProvider, {
  Trigger: FilterTrigger,
  Popover: FilterPopover,
  Item: FilterItem,
  CommandItem: FilterCommandItem,
  View: FilterView,
  SearchValueTrigger: FilterSearchValueTrigger,
  SearchValueBarItem: FilterSearchValueBarItem,
  Dialog: FilterDialog,
  DialogStringView: FilterDialogStringView,
  DialogDateView: FilterDialogDateView,
  DateView: FilterPopoverDateView,
  Date: FilterBarDate,
  Bar: FilterBar,
  BarItem: FilterBarItem,
  BarName: FilterBarName,
  BarButton: FilterBarButton,
  BarClose: FilterBarCloseButton,
  CommandInput: FilterCommandInput,
});
