import { IconExternalLink } from '@tabler/icons-react';
import { Avatar, Badge, Button } from 'erxes-ui';
import { IGithubConnection } from '../types';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function ConnectedOrgCard({ org }: { org: IGithubConnection }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface p-3">
      <div className="flex items-center gap-3">
        <Avatar size="xl">
          <Avatar.Image src={org.orgAvatarUrl} alt={org.orgName} />
          <Avatar.Fallback>{org.orgName[0]?.toUpperCase()}</Avatar.Fallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold ">{org.orgName}</span>
            <Badge variant="success">Active</Badge>
            <Badge variant="secondary">{org.orgType}</Badge>
          </div>
          <span className="mt-2 text-xs text-muted-foreground">
            Connected {formatDate(org.createdAt)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button variant="ghost" size="sm" asChild>
          <a
            href={`https://github.com/organizations/${org.orgName}/settings/installations/${org.installationId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Manage on GitHub
            <IconExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}
