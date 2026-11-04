import { useAtom } from 'jotai';
import {
  structureViewState,
  TStructureView,
} from '../states/structureViewState';

const VIEWS: TStructureView[] = ['list', 'chart'];

export const useStructureView = () => {
  const [view, setView] = useAtom(structureViewState);

  return {
    view,
    // ToggleGroup reports '' when the active item is clicked again.
    changeView: (value: string) => {
      const next = VIEWS.find((candidate) => candidate === value);

      if (next) {
        setView(next);
      }
    },
  };
};
