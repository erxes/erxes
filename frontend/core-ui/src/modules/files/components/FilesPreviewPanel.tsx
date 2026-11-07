import { usePagePanelContext } from '@/side-panel/hooks/usePagePanel';
import {
  IconChevronDown,
  IconDownload,
  IconFileUpload,
  IconFolderSymlink,
  IconLink,
  IconLinkOff,
  IconPencil,
  IconShare,
  IconTrash,
  IconUsersPlus,
  IconFile,
  IconHistory,
} from '@tabler/icons-react';
import { Button, DropdownMenu } from 'erxes-ui';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FilePreview, FileTypeIcon, RecordSidePanel } from 'ui-modules';
import { useFilesPreviewPanel } from '@/files/hooks/useFilesPreviewPanel';
import { FilesPublicLinkBadge } from '@/files/components/FilesPublicLinkBadge';
import { FilesSharedWith } from '@/files/components/FilesSharedWith';
import { FilesVersionsList } from '@/files/components/FilesVersionsList';

export const FilesPreviewPanel = () => {
  const { t } = useTranslation('files');
  const replaceRef = useRef<HTMLInputElement>(null);
  const panel = useFilesPreviewPanel();
  const entry = usePagePanelContext();

  if (!panel.file) {
    return null;
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <RecordSidePanel.Header
        avatar={
          <FileTypeIcon mimeType={panel.file.mimeType} className="size-5" />
        }
        title={panel.file.name}
        {...entry.headerProps}
        actions={
          <>
            {panel.publicLink && <FilesPublicLinkBadge labelled />}
            <FilesSharedWith sharedWith={panel.file.sharedWith} />
            {panel.canManage && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={t('rename')}
                  title={t('rename')}
                  onClick={panel.rename}
                >
                  <IconPencil />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={t('move')}
                  title={t('move')}
                  onClick={panel.move}
                >
                  <IconFolderSymlink />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  aria-label={t('move-to-trash')}
                  title={t('move-to-trash')}
                  onClick={panel.trash}
                >
                  <IconTrash />
                </Button>
              </>
            )}
          </>
        }
      />
      <RecordSidePanel.Layout
        expanded={entry.expanded}
        value={panel.tab}
        onValueChange={panel.changeTab}
        tabs={[
          {
            value: 'preview',
            label: t('preview'),
            icon: IconFile,
            content: (
              <div className="min-h-0 flex-1 overflow-auto">
                <FilePreview
                  file={panel.file}
                  onDownload={() => panel.download()}
                />
              </div>
            ),
          },
          {
            value: 'versions',
            label: `${t('versions-tab')} (${panel.versions.versions.length})`,
            icon: IconHistory,
            content: (
              <div className="min-h-0 flex-1 overflow-auto">
                <FilesVersionsList
                  versions={panel.versions.versions}
                  currentVersionId={panel.file.currentVersionId || undefined}
                  loading={panel.versions.loading}
                  restoring={panel.versions.restoring}
                  canRestore={panel.canManage}
                  onDownload={(versionId) => panel.download(versionId)}
                  onRestore={panel.versions.restore}
                />
              </div>
            ),
          },
        ]}
      />

      <div className="flex h-14 flex-none items-center justify-between gap-2 border-t px-4">
        <div className="flex items-center gap-2">
          {panel.canManage && (
            <>
              <DropdownMenu>
                <DropdownMenu.Trigger asChild>
                  <Button variant="secondary">
                    <IconShare />
                    {t('share')}
                    {panel.publicLink && <IconLink className="text-primary" />}
                    <IconChevronDown className="text-muted-foreground" />
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content align="start" side="top">
                  <DropdownMenu.Item onSelect={panel.shareWithPeople}>
                    <IconUsersPlus />
                    {t('share-with-people')}
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    disabled={panel.share.creating}
                    onSelect={panel.share.copyLink}
                  >
                    <IconLink />
                    {t('copy-link')}
                  </DropdownMenu.Item>
                  {panel.share.share && (
                    <DropdownMenu.Item
                      className="text-destructive"
                      onSelect={panel.share.revoke}
                    >
                      <IconLinkOff />
                      {t('revoke-link')}
                    </DropdownMenu.Item>
                  )}
                </DropdownMenu.Content>
              </DropdownMenu>
              <Button
                variant="secondary"
                onClick={() => replaceRef.current?.click()}
              >
                <IconFileUpload />
                {t('new-version')}
              </Button>
              <input
                ref={replaceRef}
                type="file"
                hidden
                onChange={(e) => {
                  panel.replace(Array.from(e.target.files || []));
                  e.target.value = '';
                }}
              />
            </>
          )}
        </div>
        <Button onClick={() => panel.download()}>
          <IconDownload />
          {t('download')}
        </Button>
      </div>
    </div>
  );
};
