import { Button } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { IconWorldX } from '@tabler/icons-react';
import { AppPath } from '@/types/paths/AppPath';
import { ClientPortalPath } from '@/types/paths/ClientPortalPath';

export function NoWebsiteEmptyState() {
  return (
    <div>
      <div className="h-full w-full px-8 flex justify-center">
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
          <div className="mb-6">
            <IconWorldX size={64} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No website yet</h3>
            <p className="text-muted-foreground max-w-md">
              Get started by creating your first website.
            </p>
          </div>
          <Button asChild>
            <Link to={`/${AppPath.ClientPortal}/${ClientPortalPath.CreateWebsite}`}>
              Create website
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
