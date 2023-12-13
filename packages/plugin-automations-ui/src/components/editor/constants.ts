import colors from '@erxes/ui/src/styles/colors';
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

export const BRANCH_HANDLE_OPTIONS = [
  {
    id: 'yes-right',
    position: Position.Right,
    label: 'True',
    labelStyle: {
      marginLeft: 20
    },
    style: {
      right: -10,
      top: 40,
      background: colors.colorCoreGreen
    }
  },
  {
    id: 'no-right',
    position: Position.Right,
    label: 'False',
    labelStyle: {
      marginLeft: 20
    },
    style: {
      right: -10,
      top: 80,
      background: colors.colorCoreRed
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
