import { IconBrandTrello, IconSettings } from '@tabler/icons-react';
import { Button, useQueryState } from 'erxes-ui';
import { Link } from 'react-router-dom';
import clsx from 'clsx';


export const TicketPipelineFallback = ({className}: {className?: string}) => {
  const [channelId] = useQueryState<string | null>('channelId');
  return (
    <div className={clsx("flex h-full w-full flex-col items-center justify-center text-center p-6 gap-2", className)}>
      <IconBrandTrello
        size={64}
        stroke={1.5}
        className="text-muted-foreground"
      />
      <h2 className="text-lg font-semibold text-muted-foreground">
        No pipeline yet
      </h2>
      <p className="text-md text-muted-foreground mb-4">
        Create a pipeline to start organizing your board.
      </p>
      <Button variant="outline" asChild className='z-20'>
        <Link to={`/settings/frontline/channels/${channelId}/pipelines`}>
          <IconSettings />
          Manage pipelines
        </Link>
      </Button>
    </div>
  );
};
