import { paths } from '~/lib/paths';
import { IconMapOff } from '@tabler/icons-react';
import { buttonVariants } from 'erxes-ui';
import { Link } from 'react-router-dom';

export const NotFoundPage = () => (
  <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
    <IconMapOff className="size-8 text-muted-foreground" />
    <p className="text-sm text-muted-foreground">This page does not exist.</p>
    <Link to={paths.home} className={buttonVariants({ variant: 'outline' })}>
      Go home
    </Link>
  </div>
);
