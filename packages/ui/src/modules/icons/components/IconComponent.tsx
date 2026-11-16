import { useAtomValue } from 'jotai';
import { Icon123, type TablerIcon } from '@tabler/icons-react';
import type { ComponentProps } from 'react';
import { iconsState } from '../states/iconsState';

/**
 * A Tabler icon by its name, such as one stored on a record.
 * It shows `Icon123` for an unknown name, or until `IconsProvider` has loaded the icons.
 */
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
