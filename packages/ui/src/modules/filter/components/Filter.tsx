import { FilterDialogDateView } from '../date-filter/components/DialogDateView';
import {
  FilterBar,
  FilterBarButton,
  FilterBarCloseButton,
  FilterBarDate,
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
  FilterPopoverDateView,
  FilterSearchValueTrigger,
  FilterTrigger,
  FilterView,
} from './FilterPopover';
import { FilterProvider } from './FilterProvider';

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
  Bar: FilterBar,
  BarItem: FilterBarItem,
  BarName: FilterBarName,
  BarButton: FilterBarButton,
  BarClose: FilterBarCloseButton,
  Date: FilterBarDate,
  CommandInput: FilterCommandInput,
});
