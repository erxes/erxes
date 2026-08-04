import { FC } from 'react';
import { useMessenger } from '../hooks/useMessenger';
import { Button, cn } from 'erxes-ui';
import { IconX } from '@tabler/icons-react';

type Props = {
  className?: string;
  iconClassName?: string;
  size?: number;
};

export const CloseButton: FC<Props> = ({
  className,
  iconClassName,
  size = 20,
}) => {
  const { closeWindow } = useMessenger();

  return (
    <Button
      variant={'ghost'}
      size={'icon'}
      onClick={closeWindow}
      aria-label="Close messenger"
      className={cn(
        'flex-none text-primary-foreground size-6 flex items-center justify-center',
        className,
      )}
    >
      <IconX size={size} className={cn(iconClassName)} />
    </Button>
  );
};
