export interface IFilterContext {
  id: string;
  sessionKey?: string;
  resetFilterState: () => void;
  setOpen: (open: boolean) => void;
  setView: (view: string) => void;
  setDialogView: (view: string) => void;
  setOpenDialog: (open: boolean) => void;
}
