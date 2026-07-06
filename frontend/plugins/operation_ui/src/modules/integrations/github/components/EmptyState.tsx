import { IconBrandGithub } from '@tabler/icons-react';
import { Button } from 'erxes-ui';

export function EmptyState({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
      <IconBrandGithub className="size-16" />
      <div>
        <h3 className="font-semibold ">No organizations connected</h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-sm">
          Connect a GitHub organization to sync issues and pull requests with
          erxes tasks.
        </p>
      </div>
      <Button onClick={onConnect}>Connect GitHub Organization</Button>
    </div>
  );
}
