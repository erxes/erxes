import { IconFolder, IconUpload } from '@tabler/icons-react';
import {
  Button,
  Checkbox,
  Dialog,
  Empty,
  formatBytes,
  Input,
  Spinner,
} from 'erxes-ui';
import { ReactNode, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useFilePicker } from '../hooks/useFilePicker';
import { IFile } from '../types';
import { FilesBreadcrumb } from './FilesBreadcrumb';
import { FilesSpaceTabs } from './FilesSpaceTabs';
import { FileTypeIcon } from './FileTypeIcon';

type TFilePickerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (files: IFile[]) => void;
  multiple?: boolean;
  accept?: (file: IFile) => boolean;
  title?: ReactNode;
};

export const FilePicker = (props: TFilePickerProps) => {
  const { t } = useTranslation('files');
  const inputRef = useRef<HTMLInputElement>(null);
  const picker = useFilePicker(props);

  return (
    <Dialog open={props.open} onOpenChange={picker.close}>
      <Dialog.Content className="max-w-2xl">
        <Dialog.Header>
          <Dialog.Title>{props.title || t('choose-files')}</Dialog.Title>
          <Dialog.Description className="sr-only">
            {t('choose-files')}
          </Dialog.Description>
        </Dialog.Header>

        <div className="flex items-center gap-2">
          <Input
            placeholder={t('search-files')}
            value={picker.searchValue}
            onChange={(e) => picker.setSearchValue(e.target.value)}
          />
          <Button
            variant="secondary"
            disabled={!picker.canUpload}
            onClick={() => inputRef.current?.click()}
          >
            <IconUpload />
            {t('upload')}
          </Button>
          <input
            ref={inputRef}
            type="file"
            multiple
            hidden
            onChange={(e) => {
              picker.uploadHere(Array.from(e.target.files || []));
              e.target.value = '';
            }}
          />
        </div>

        <FilesSpaceTabs value={picker.space} onChange={picker.changeSpace} />
        <FilesBreadcrumb
          space={picker.space}
          path={picker.path}
          onOpen={picker.openFolder}
          size="sm"
        />

        <div className="h-80 overflow-y-auto rounded border">
          {picker.loading && !picker.files.length && (
            <div className="flex h-full items-center justify-center">
              <Spinner />
            </div>
          )}

          {!picker.loading &&
            !picker.folders.length &&
            !picker.files.length && (
              <Empty className="h-full">
                <Empty.Header>
                  <Empty.Title>
                    {picker.isSharedList
                      ? t('shared-empty-title')
                      : t('empty-title')}
                  </Empty.Title>
                  <Empty.Description>
                    {picker.isSharedList
                      ? t('shared-empty-description')
                      : t('empty-picker-description')}
                  </Empty.Description>
                </Empty.Header>
              </Empty>
            )}

          {picker.folders.map((folder) => (
            <button
              key={folder._id}
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
              onClick={() => picker.openFolder(folder._id)}
            >
              <IconFolder className="size-4 text-muted-foreground" />
              <span className="truncate">{folder.name}</span>
            </button>
          ))}

          {picker.files.map((file) => (
            <label
              key={file._id}
              className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
            >
              <Checkbox
                checked={picker.isSelected(file)}
                onCheckedChange={() => picker.toggle(file)}
              />
              <FileTypeIcon
                mimeType={file.mimeType}
                className="size-4 text-muted-foreground"
              />
              <span className="truncate flex-1">{file.name}</span>
              <span className="text-xs text-muted-foreground">
                {formatBytes(file.size, 1)}
              </span>
            </label>
          ))}

          {picker.hasMore && (
            <div className="p-2 text-center">
              <Button variant="ghost" size="sm" onClick={picker.loadMore}>
                {t('load-more')}
              </Button>
            </div>
          )}
        </div>

        {picker.error && (
          <div className="text-sm text-destructive">{picker.error.message}</div>
        )}

        <Dialog.Footer>
          <Button variant="secondary" onClick={() => picker.close(false)}>
            {t('cancel')}
          </Button>
          <Button disabled={!picker.selected.length} onClick={picker.confirm}>
            {t('select-count', { count: picker.selected.length })}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
