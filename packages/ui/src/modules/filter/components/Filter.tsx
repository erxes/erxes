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

/**
 * Parts of a filter popover and bar, which `ListFilter` is built from.
 * A list page uses `ListFilter`; reach for these parts only for a filter it can't draw.
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
  Bar: FilterBar,
  BarItem: FilterBarItem,
  BarName: FilterBarName,
  BarButton: FilterBarButton,
  BarClose: FilterBarCloseButton,
  CommandInput: FilterCommandInput,
});
