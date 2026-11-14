import { paths } from '~/lib/paths';
import type { FileSettings } from '@erxes/core-contract';
import { IconCloudUpload, IconServer } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { PageContainer, PageHeader, ScrollArea } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { QueryState } from '~/components/QueryState';
import { useCan } from '~/modules/auth/session';
import { fileSettingsQuery, LimitsForm } from './LimitsForm';
import { TryUpload } from './TryUpload';

/** Where files go; set by whoever runs the server (FILES_STORAGE). */
const StorageInfo = ({ settings }: { settings: FileSettings }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'file-upload' });

  return (
    <section className="flex gap-4 rounded-lg border bg-background p-5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground">
        {settings.storage === 's3' ? (
          <IconCloudUpload className="size-4" />
        ) : (
          <IconServer className="size-4" />
        )}
      </span>
      <div className="space-y-1">
        <h2 className="text-base font-semibold">
          {settings.storage === 's3'
            ? t('storage-s3', 'S3-compatible storage')
            : t('storage-local', 'This server’s disk')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {settings.storage === 's3'
            ? t(
                'storage-s3-description',
                'Files go straight from the browser to the bucket (AWS S3, Cloudflare R2, MinIO …). erxes only keeps their details.',
              )
            : t(
                'storage-local-description',
                'Files are kept on the erxes server. For many or large files, ask your administrator to use cloud storage.',
              )}
        </p>
        <p className="text-xs text-muted-foreground">
          {t(
            'storage-config',
            'Storage and its keys are set in the server configuration, not here, so secrets never reach the browser.',
          )}
        </p>
      </div>
    </section>
  );
};

/** Settings › File upload. */
export const FileUploadSettingsPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'file-upload' });
  const settings = useQuery(fileSettingsQuery());
  const canEdit = useCan()('settings.manage');

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[
              {
                label: t('title', 'File upload'),
                to: paths.settings.fileUpload,
                icon: IconCloudUpload,
              },
            ]}
          />
        </PageHeader.Start>
      </PageHeader>
      <ScrollArea className="flex-1">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-6">
          <QueryState query={settings} className="py-12">
            {(data) => (
              <>
                {!canEdit && (
                  <p className="rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground">
                    {t('read-only', 'Only owners and admins can change these settings.')}
                  </p>
                )}
                <LimitsForm settings={data} canEdit={canEdit} />
                <StorageInfo settings={data} />
                <TryUpload />
              </>
            )}
          </QueryState>
        </div>
      </ScrollArea>
    </PageContainer>
  );
};
