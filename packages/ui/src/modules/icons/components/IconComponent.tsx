import { useAtomValue } from 'jotai';
import { Icon123, type TablerIcon } from '@tabler/icons-react';
import type { ComponentProps } from 'react';
import { iconsState } from '../states/iconsState';

export const IconComponent = ({
  name,
  ...props
}: ComponentProps<TablerIcon> & {
  name?: string;
}) => {
  const icons = useAtomValue(iconsState);
  const Icon = (name && icons[name]) || Icon123;

  return <Icon {...props} />;
};
