import { useAtom } from 'jotai';
import {
  structureViewState,
  TStructureView,
} from '../states/structureViewState';

const VIEWS: TStructureView[] = ['canvas', 'list'];

export const useStructureView = () => {
  const [view, setView] = useAtom(structureViewState);

  return {
    view: VIEWS.includes(view) ? view : 'canvas',
    changeView: (value: string) => {
      const next = VIEWS.find((candidate) => candidate === value);

      if (next) {
        setView(next);
      }
    },
  };
};
