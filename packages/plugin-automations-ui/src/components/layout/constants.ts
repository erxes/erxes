import { colors } from '@erxes/ui/src';
import { Position } from 'reactflow';

export const DEFAULT_HANDLE_STYLE = {
  width: 20,
  height: 20,
  zIndex: -1
};

export const DEFAULT_HANDLE_OPTIONS = [
  {
    id: 'right',
    position: Position.Right,
    style: {
      right: -10,
      background: colors.colorSecondary
    }
  },
  {
    id: 'left',
    position: Position.Left,
    style: {
      left: -10,
      background: colors.colorCoreYellow
    }
  }
];
