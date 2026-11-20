import type { IntegrationProgram } from '@erxes/core-contract';
import { memberQueries, orpc } from '@erxes/core-contract/client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Badge, Button, MemberInline, Spinner, useConfirm, useFormat, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';
import { useIntegrationsSaved } from './customMutation';
import { OverviewSection } from './IntegrationLayout';

export const CustomProgramVersions = ({ program }: { program: IntegrationProgram }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.custom' });
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const fmt = useFormat();

  const versions = useQuery(
    orpc.integrations.programVersions.queryOptions({ input: { id: program.id } }),
  );

  const restore = useMutation(
    orpc.integrations.restoreProgram.mutationOptions(
      useIntegrationsSaved(t('restore-failed', 'Could not restore'), () =>
        toast({ title: t('restored', 'Restored. It is live now.') }),
      ),
    ),
  );

  return (
    <OverviewSection title={t('versions', 'Versions')}>
      <QueryState
        query={versions}
        isEmpty={({ data }) => !data.length}
        empty={
          <p className="text-sm text-muted-foreground">{t('versions-empty', 'No versions')}</p>
        }
      >
        {({ data }) => (
          <ul className="divide-y rounded-lg border text-sm">
            {data.map((version) => (
              <li key={version.version} className="flex flex-wrap items-center gap-3 px-3 py-2">
                <span className="font-medium">
                  {t('version', 'Version {{version}}', { version: version.version })}
                </span>
                {version.version === program.version && (
                  <Badge variant="success">{t('live', 'Live')}</Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {fmt.dateTime(version.createdAt)}
                </span>
                <span className="min-w-0 flex-1">
                  <MemberInline memberId={version.createdBy ?? undefined} members={memberQueries} />
                </span>
                {version.version !== program.version && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={restore.isPending}
                    onClick={() =>
                      void confirm({
                        message: t('restore-confirm', 'Restore version {{version}}?', {
                          version: version.version,
                        }),
                        options: {
                          description: t(
                            'restore-description',
                            'It goes live at once, as a new version. Automations use it from now on.',
                          ),
                        },
                      }).then(() => restore.mutate({ id: program.id, version: version.version }))
                    }
                  >
                    {t('restore', 'Restore')}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </QueryState>
      {restore.isPending && <Spinner size="sm" />}
    </OverviewSection>
  );
};
