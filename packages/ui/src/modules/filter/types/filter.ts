import { Icon } from '@tabler/icons-react';

export interface IFilter {
  accessoryKey: string;
  sessionKey: string;
  label: string;
  icon: Icon;
  dropdown: (filter: FilterDropdownProps) => React.ReactNode;
  bar: (filter: FilterBarComponentPropsBase) => React.ReactNode;
  condition: (filter: FilterBarComponentPropsBase) => React.ReactNode;
}

export type FilterBarComponentPropsBase = Omit<
  IFilter,
  'dropdown' | 'bar' | 'conditions'
>;
export interface FilterDropdownProps extends FilterBarComponentPropsBase {
  onOpenChange: (open: boolean) => void;
}

export interface IFilterContext {
  id: string;
  sessionKey?: string;
  resetFilterState: () => void;
  setOpen: (open: boolean) => void;
  setView: (view: string) => void;
  setDialogView: (view: string) => void;
  setOpenDialog: (open: boolean) => void;
}
