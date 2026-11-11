import { IconMapOff } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { Link } from 'react-router-dom';

export const NotFoundPage = () => (
  <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
    <IconMapOff className="size-8 text-muted-foreground" />
    <p className="text-sm text-muted-foreground">This page does not exist.</p>
    <Button variant="outline" asChild>
      <Link to="/">Go home</Link>
    </Button>
  </div>
);
