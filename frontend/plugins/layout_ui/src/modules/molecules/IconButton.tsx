import * as React from 'react';
import { Icon } from '@tabler/icons-react';
import { Button } from '../atoms/Button';

type ButtonProps = React.ComponentProps<typeof Button>;

export type IconButtonProps = Omit<ButtonProps, 'children'> & {
  icon: Icon;
  label: string;
  iconPosition?: 'start' | 'end';
};

export const IconButton: React.FC<IconButtonProps> = ({
  icon: IconCmp,
  label,
  iconPosition = 'start',
  ...props
}) => (
  <Button {...props}>
    {iconPosition === 'start' && <IconCmp size={16} />}
    {label}
    {iconPosition === 'end' && <IconCmp size={16} />}
  </Button>
);
