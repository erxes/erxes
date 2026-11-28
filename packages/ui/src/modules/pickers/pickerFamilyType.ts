import type { ComponentType, ReactNode } from 'react';
import type { PickerMode, PickerProps } from './selectFamily';

/** A filter part's address key, and whether it keeps one id or several. */
export interface FilterProps {
  filterKey: string;
  mode?: PickerMode;
}

/** The parts of a picker family; `P` is its props for reading records (`units`, `products`). */
export interface PickerFamily<P> {
  /** The searchable list alone, for a popover of the page's own. */
  Content: ComponentType<P & PickerProps & { onPick?: () => void }>;
  /** The picked records as a trigger shows them. */
  Value: ComponentType<P & PickerProps>;
  /** The picked records in a table cell; a click opens the list. */
  InlineCell: ComponentType<P & PickerProps & { scope?: string }>;
  /** A picker button inside `Form.Item`, as the field's control. */
  FormItem: ComponentType<P & PickerProps & { className?: string }>;
  /** A picker button of its own, outside a form. */
  Field: ComponentType<P & PickerProps & { className?: string }>;
  /** The filter popover's row that opens this picker's view. */
  FilterItem: ComponentType<{ value: string; label: ReactNode }>;
  /** The picker as the filter popover's view of `filterKey`. */
  FilterView: ComponentType<P & FilterProps>;
  /** The filter's chip on the bar while `filterKey` is set. */
  FilterBar: ComponentType<P & FilterProps & { label: ReactNode }>;
}
