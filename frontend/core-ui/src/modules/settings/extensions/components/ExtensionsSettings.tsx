import { useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { Link } from 'react-router-dom';
import { Breadcrumb, Button, Empty, Skeleton, toast } from 'erxes-ui';
import {
  currentUserState,
  PageHeader,
  PageHeaderEnd,
  PageHeaderStart,
} from 'ui-modules';
import { IconPuzzle } from '@tabler/icons-react';
import { useReloadExtensions } from '@/plugins/hooks/useReloadExtensions';
import { ExtensionsUnavailableError, extensionsApi } from '../extensionsApi';
import { useExtensionsQuery } from '../hooks/useExtensionsQuery';
import { ExtensionsTable } from './ExtensionsTable';
import { InstallExtension } from './InstallExtension';

const Notice = ({
  title,
  description,
}: Readonly<{ title: string; description?: string }>) => (
  <Empty className="m-3 min-h-80">
    <Empty.Header>
      <Empty.Media variant="icon">
        <IconPuzzle />
      </Empty.Media>
      <Empty.Title>{title}</Empty.Title>
      {description && <Empty.Description>{description}</Empty.Description>}
    </Empty.Header>
  </Empty>
);

const ExtensionsList = () => {
  const { data, error, loading, refetch } = useExtensionsQuery(
    extensionsApi.list,
  );
  const reloadExtensions = useReloadExtensions();

  // The list, and the extensions' screens everywhere else in erxes.
  const onChanged = useCallback(() => {
    refetch();
    reloadExtensions().catch((e: unknown) =>
      toast({
        variant: 'destructive',
        title: 'Reload the page to see the change in its screens',
        description: e instanceof Error ? e.message : String(e),
      }),
    );
  }, [refetch, reloadExtensions]);

  const body = () => {
    if (loading) {
      return (
        <div className="m-3 space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      );
    }

    if (error instanceof ExtensionsUnavailableError) {
      return <Notice title={error.message} />;
    }

    if (error || !data) {
      return (
        <Notice
          title="Could not load extensions"
          description={error?.message}
        />
      );
    }

    if (data.length === 0) {
      return (
        <Notice
          title="No extensions installed"
          description="Install one from a built .erxext.json file."
        />
      );
    }

    return <ExtensionsTable data={data} onChanged={onChanged} />;
  };

  return (
    <>
      <PageHeader>
        <PageHeaderStart>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/settings/extensions">
                    <IconPuzzle />
                    Extensions
                  </Link>
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
        </PageHeaderStart>
        <PageHeaderEnd>
          {data && (
            <InstallExtension installed={data} onInstalled={onChanged} />
          )}
        </PageHeaderEnd>
      </PageHeader>
      {body()}
    </>
  );
};

export function ExtensionsSettings() {
  const isOwner = useAtomValue(currentUserState)?.isOwner;

  if (!isOwner) {
    return <Notice title="Only the workspace owner manages extensions" />;
  }

  return <ExtensionsList />;
}
