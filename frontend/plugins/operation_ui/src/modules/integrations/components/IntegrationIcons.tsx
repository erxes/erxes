import {
  IconBrandDiscordFilled,
  IconBrandGithubFilled,
} from '@tabler/icons-react';
import { cn } from 'erxes-ui';

export const DiscordLogo = ({
  className,
}: Readonly<{ className?: string }>) => (
  <IconBrandDiscordFilled className={cn('text-[#5865F2]', className)} />
);

export const GithubLogo = ({ className }: Readonly<{ className?: string }>) => (
  <IconBrandGithubFilled className={cn('text-foreground', className)} />
);
