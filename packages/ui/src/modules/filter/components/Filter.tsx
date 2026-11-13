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
  Bar: FilterBar,
  BarItem: FilterBarItem,
  BarName: FilterBarName,
  BarButton: FilterBarButton,
  BarClose: FilterBarCloseButton,
  CommandInput: FilterCommandInput,
});
