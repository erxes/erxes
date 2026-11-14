import { useSetAtom } from 'jotai';
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

  const resetFilterState = () => {
    setOpen(false);
    setView('root');
    setDialogView('root');
    setOpenDialog(false);
  };

  return (
    <FilterContext.Provider
      value={{
        id,
        resetFilterState,
        setOpen,
        setView,
        setDialogView,
        setOpenDialog,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};
