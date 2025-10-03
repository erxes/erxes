import { Key } from 'erxes-ui/types/Key';
import { useRecordTableHotkey } from '../contexts/RecordTableHotkeyContext';
import { useScopedHotkeys } from 'erxes-ui/modules/hotkey';

export const RecordTableArrowEffect = ({
  columnLength,
  rowLength,
}: {
  columnLength: number;
  rowLength: number;
}) => {
  const { activeCell, setActiveCell, scope } = useRecordTableHotkey();
  useScopedHotkeys(
    Key.ArrowRight,
    () => {
      if (
        activeCell[0] === rowLength - 1 &&
        activeCell[1] === columnLength - 1
      ) {
        return;
      }
      if (activeCell[1] === columnLength - 1 && activeCell[0] < rowLength) {
        return setActiveCell([activeCell[0] + 1, 0]);
      }
      setActiveCell([activeCell[0], activeCell[1] + 1]);
    },
    scope,
  );

  useScopedHotkeys(
    Key.ArrowLeft,
    () => {
      if (activeCell[0] === 0 && activeCell[1] === 0) {
        return;
      }
      if (activeCell[1] === 0 && activeCell[0] > 0) {
        return setActiveCell([activeCell[0] - 1, columnLength - 1]);
      }
      setActiveCell([activeCell[0], activeCell[1] - 1]);
    },
    scope,
  );

  useScopedHotkeys(
    Key.ArrowUp,
    () => {
      if (activeCell[0] === 0) {
        return;
      }
      setActiveCell([activeCell[0] - 1, activeCell[1]]);
    },
    scope,
  );

  useScopedHotkeys(
    Key.ArrowDown,
    () => {
      if (activeCell[0] === rowLength - 1) {
        return;
      }
      setActiveCell([activeCell[0] + 1, activeCell[1]]);
    },
    scope,
  );

  return null;
};
