import {
  IconChevronDown,
  IconDownload,
  IconFileUpload,
  IconFolderSymlink,
  IconLayoutColumns,
  IconLayoutSidebarRightExpand,
  IconLink,
  IconLinkOff,
  IconPencil,
  IconShare,
  IconTrash,
  IconUsersPlus,
  IconX,
} from '@tabler/icons-react';
import { Badge, Button, cn, DropdownMenu, Separator, Tabs } from 'erxes-ui';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FilePreview, FileTypeIcon } from 'ui-modules';
import { useFilesPreviewPanel } from '../hooks/useFilesPreviewPanel';
import { FilesPublicLinkBadge } from './FilesPublicLinkBadge';
import { FilesSharedWith } from './FilesSharedWith';
import { FilesVersionsList } from './FilesVersionsList';

export const FilesPreviewPanel = () => {
  const { t } = useTranslation('files');
  const replaceRef = useRef<HTMLInputElement>(null);
  const panel = useFilesPreviewPanel();

  if (!panel.file) {
    return null;
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="flex flex-none items-center gap-3 border-b bg-background px-4 py-3">
        <span
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-lg',
            panel.tone,
          )}
        >
          <FileTypeIcon mimeType={panel.file.mimeType} className="size-5" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="truncate text-base" title={panel.file.name}>
              {panel.file.name}
            </h2>
            {panel.publicLink && <FilesPublicLinkBadge labelled />}
          </div>
          <p className="truncate text-xs text-muted-foreground">{panel.meta}</p>
        </div>
        {panel.canManage && (
          <>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t('rename')}
              title={t('rename')}
              onClick={panel.rename}
            >
              <IconPencil />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t('move')}
              title={t('move')}
              onClick={panel.move}
            >
              <IconFolderSymlink />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              aria-label={t('move-to-trash')}
              title={t('move-to-trash')}
              onClick={panel.trash}
            >
              <IconTrash />
            </Button>
            <Separator.Inline />
          </>
        )}
        <Button
          variant="ghost"
          size="icon"
          aria-label={t(panel.isSplit ? 'open-as-sheet' : 'open-beside-list')}
          title={t(panel.isSplit ? 'open-as-sheet' : 'open-beside-list')}
          onClick={panel.toggleMode}
        >
          {panel.isSplit ? (
            <IconLayoutSidebarRightExpand />
          ) : (
            <IconLayoutColumns />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('close')}
          onClick={panel.close}
        >
          <IconX />
        </Button>
      </div>

      <Tabs
        value={panel.tab}
        onValueChange={panel.changeTab}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="flex items-center gap-3 border-b px-4">
          <Tabs.List className="border-b-0">
            <Tabs.Trigger value="preview">{t('preview')}</Tabs.Trigger>
            <Tabs.Trigger value="versions" className="gap-1.5">
              {t('versions-tab')}
              <Badge variant="secondary" className="px-1.5">
                {panel.versions.versions.length}
              </Badge>
            </Tabs.Trigger>
          </Tabs.List>
          <span className="ml-auto">
            <FilesSharedWith sharedWith={panel.file.sharedWith} />
          </span>
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          {panel.tab === 'preview' ? (
            <FilePreview
              file={panel.file}
              onDownload={() => panel.download()}
            />
          ) : (
            <FilesVersionsList
              versions={panel.versions.versions}
              currentVersionId={panel.file.currentVersionId || undefined}
              loading={panel.versions.loading}
              restoring={panel.versions.restoring}
              canRestore={panel.canManage}
              onDownload={(versionId) => panel.download(versionId)}
              onRestore={panel.versions.restore}
            />
          )}
        </div>
      </Tabs>

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
