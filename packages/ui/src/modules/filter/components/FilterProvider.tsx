import { useSetAtom } from 'jotai';
import { useMemo } from 'react';
import { FilterContext } from '../context/FilterContext';
import {
  filterDialogViewState,
  filterPopoverViewState,
  openDialogState,
  openPopoverState,
} from '../states/filterStates';

export const FilterProvider = ({ children, id }: { children: React.ReactNode; id: string }) => {
  const setOpen = useSetAtom(openPopoverState(id));
  const setView = useSetAtom(filterPopoverViewState(id));
  const setDialogView = useSetAtom(filterDialogViewState(id));
  const setOpenDialog = useSetAtom(openDialogState(id));

  const filter = useMemo(
    () => ({
      id,
      resetFilterState: () => {
        setOpen(false);
        setView('root');
        setDialogView('root');
        setOpenDialog(false);
      },
      setOpen,
      setView,
      setDialogView,
      setOpenDialog,
    }),
    [id, setOpen, setView, setDialogView, setOpenDialog],
  );

  return <FilterContext.Provider value={filter}>{children}</FilterContext.Provider>;
};
