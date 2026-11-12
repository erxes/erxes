import { IconHistory } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, Sheet, Spinner, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api, messageOf } from '~/lib/api';
import { useCan } from '~/modules/auth/session';

/** Published versions; restoring one makes it the working copy (published at once when on). */
export const VersionsPanel = ({
  automationId,
  active,
}: {
  automationId: string;
  active: number | null;
}) => {
  const { t } = useTranslation('automations');
  const { toast } = useToast();
  const client = useQueryClient();
  const can = useCan();
  const [open, setOpen] = useState(false);
  const versions = useQuery({
    queryKey: ['automations', automationId, 'versions'],
    queryFn: () => api.automations.versions({ id: automationId }),
    enabled: open,
  });
  const restore = useMutation({
    mutationFn: (version: number) => api.automations.restoreVersion({ id: automationId, version }),
    onSuccess: (next) => {
      client.setQueryData(['automations', automationId], next);
      void client.invalidateQueries({ queryKey: ['automations', automationId, 'versions'] });
      toast({ title: t('restored', 'Version restored') });
    },
    onError: (error) =>
      toast({
        variant: 'destructive',
        title: t('failed', 'Something went wrong'),
        description: messageOf(error),
      }),
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>
        <Button variant="ghost" title={t('versions', 'Versions')}>
          <IconHistory />
        </Button>
      </Sheet.Trigger>
      <Sheet.View className="flex w-full flex-col gap-4 p-4 sm:max-w-md">
        <Sheet.Header>
          <Sheet.Title>{t('versions', 'Versions')}</Sheet.Title>
          <Sheet.Description className="text-sm text-muted-foreground">
            {t(
              'versions-description',
              'Each time it was turned on or changed while on. Runs keep the version they started with.',
            )}
          </Sheet.Description>
          <Sheet.Close />
        </Sheet.Header>
        {versions.isLoading ? (
          <Spinner />
        ) : (
          <ul className="space-y-2">
            {versions.data?.data.map((version) => (
              <li
                key={version.version}
                className="flex items-center gap-2 rounded-md border p-2 text-sm"
              >
                <span className="font-medium">v{version.version}</span>
                {version.version === active && (
                  <Badge variant="success">{t('current', 'current')}</Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {new Date(version.createdAt).toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t('steps-count', '{{count}} steps', { count: version.definition.steps.length })}
                </span>
                {version.version !== active && can('automations.manage') && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-auto"
                    disabled={restore.isPending}
                    onClick={() => restore.mutate(version.version)}
                  >
                    {t('restore', 'Restore')}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Sheet.View>
    </Sheet>
  );
};
