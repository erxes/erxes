import { IconHistory } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, Sheet, useToast, useFormat } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { useCan } from '~/modules/auth/session';
import { automationQuery } from './automationQueries';

const VersionList = ({ automationId, active }: { automationId: string; active: number | null }) => {
  const { t } = useTranslation('automations');
  const fmt = useFormat();
  const { toast } = useToast();
  const client = useQueryClient();
  const canManage = useCan()('automations.manage');

  const versions = useQuery(
    orpc.automations.versions.queryOptions({ input: { id: automationId } }),
  );

  const restore = useMutation(
    orpc.automations.restoreVersion.mutationOptions({
      onSuccess: (next) => {
        client.setQueryData(automationQuery(automationId).queryKey, next);
        void client.invalidateQueries({
          queryKey: orpc.automations.versions.key({ input: { id: automationId } }),
        });
        toast({ title: t('restored', 'Version restored') });
      },
      onError: (error) =>
        toast({
          variant: 'destructive',
          title: t('failed', 'Something went wrong'),
          description: messageOf(error),
        }),
    }),
  );

  return (
    <QueryState query={versions}>
      {({ data }) => (
        <ul className="space-y-2">
          {data.map((version) => (
            <li
              key={version.version}
              className="flex items-center gap-2 rounded-md border p-2 text-sm"
            >
              <span className="font-medium">v{version.version}</span>
              {version.version === active && (
                <Badge variant="success">{t('current', 'current')}</Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {fmt.dateTime(version.createdAt)}
              </span>
              <span className="text-xs text-muted-foreground">
                {t('steps-count', '{{count}} steps', { count: version.definition.steps.length })}
              </span>
              {version.version !== active && canManage && (
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-auto"
                  disabled={restore.isPending}
                  onClick={() => restore.mutate({ id: automationId, version: version.version })}
                >
                  {t('restore', 'Restore')}
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </QueryState>
  );
};

/** Published versions; restoring one makes it the working copy (published at once when on). */
export const VersionsPanel = ({
  automationId,
  active,
}: {
  automationId: string;
  active: number | null;
}) => {
  const { t } = useTranslation('automations');
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger
        render={
          <Button
            variant="ghost"
            title={t('versions', 'Versions')}
            aria-label={t('versions', 'Versions')}
          />
        }
      >
        <IconHistory />
      </Sheet.Trigger>
      <Sheet.View>
        <Sheet.Header>
          <Sheet.Title>{t('versions', 'Versions')}</Sheet.Title>
          <Sheet.Description>
            {t(
              'versions-description',
              'Each time it was turned on or changed while on. Runs keep the version they started with.',
            )}
          </Sheet.Description>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="min-h-0 overflow-y-auto">
          {open && <VersionList automationId={automationId} active={active} />}
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
