import { colors } from '@erxes/ui/src';

export const responseTypes = [
  {
    label: 'Approved',
    value: 'approved',
    icon: 'like-1',
    color: colors.colorCoreGreen
  },
  {
    label: 'Declined',
    value: 'declined',
    icon: 'dislike',
    color: colors.colorCoreRed
  },
  {
    label: 'Waiting',
    value: 'waiting',
    icon: 'clock',
    color: colors.colorCoreBlue
  }
];
