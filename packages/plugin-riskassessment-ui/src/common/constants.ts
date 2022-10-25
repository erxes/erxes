import { colors } from '@erxes/ui/src';

export const statusColorConstant = [
  {
    name: 'In_Progress',
    color: colors.colorCoreBlue
  },
  {
    name: 'Error',
    color: colors.colorCoreRed
  },
  {
    name: 'Warning',
    color: colors.colorCoreYellow
  },
  {
    name: 'Success',
    color: colors.colorCoreGreen
  },
  {
    name: 'No_Result',
    color: colors.colorCoreGray
  }
];

export const COLORS = [colors.colorCoreRed, colors.colorCoreYellow, colors.colorCoreGreen];

export const calculateMethods = [
  {
    value: '',
    label: 'Choose Calculate Method'
  },
  {
    value: 'Addition',
    label: 'Addition'
  },
  {
    value: 'Multiply',
    label: 'Multiply'
  },
  {
    value: 'Matrix',
    label: 'Matrix'
  }
];
