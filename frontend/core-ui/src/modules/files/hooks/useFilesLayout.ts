import { useAtom } from 'jotai';
import { filesLayoutState, TFilesLayout } from '../states/filesLayoutState';

const LAYOUTS: TFilesLayout[] = ['list', 'grid'];

export const useFilesLayout = () => {
  const [layout, setLayout] = useAtom(filesLayoutState);

  return {
    layout,
    // ToggleGroup reports '' when the active item is clicked again.
    changeLayout: (value: string) => {
      const next = LAYOUTS.find((candidate) => candidate === value);

      if (next) {
        setLayout(next);
      }
    },
  };
};
