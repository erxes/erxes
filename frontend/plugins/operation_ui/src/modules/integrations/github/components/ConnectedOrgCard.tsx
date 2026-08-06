import { IconExternalLink } from '@tabler/icons-react';
import { Avatar, Badge, Button, Spinner } from 'erxes-ui';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function ConnectedOrgCard({
  org,
  onDisconnect,
  disconnecting,
}: {
  org: {
    installationId: number;
    orgName: string;
    orgAvatarUrl?: string;
    orgType: string;
    createdAt: string;
  };
  onDisconnect: () => void;
  disconnecting: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface p-3">
      <div className="flex items-center gap-3">
        <Avatar
          src={org.orgAvatarUrl}
          alt={org.orgName}
          fallback={org.orgName[0]?.toUpperCase()}
          size="md"
        />
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold ">{org.orgName}</span>
            <Badge variant="success" size="sm">
              Active
            </Badge>
            <Badge variant="outline" size="sm">
              {org.orgType}
            </Badge>
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
        <Button
          variant="destructive"
          size="sm"
          onClick={onDisconnect}
          disabled={disconnecting}
          className="gap-2"
        >
          {disconnecting ? <Spinner size="sm" /> : 'Disconnect'}
        </Button>
      </div>
    </div>
  );
}
