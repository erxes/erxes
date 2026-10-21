import { IconFolderPlus, IconUpload } from '@tabler/icons-react';
import { Button, Input, Separator } from 'erxes-ui';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FilesBreadcrumb, PageHeader } from 'ui-modules';
import { useFilesHeader } from '../hooks/useFilesHeader';
import { FilesBreadcrumbDrop } from './FilesBreadcrumbDrop';
import { FilesDisplayControl } from './FilesDisplayControl';
import { FilesUsageMeter } from './FilesUsageMeter';

export const FilesHeader = () => {
  const { t } = useTranslation('files');
  const inputRef = useRef<HTMLInputElement>(null);
  const header = useFilesHeader();

  return (
    <PageHeader>
      <PageHeader.Start>
        <FilesBreadcrumb
          space={header.space}
          path={header.path}
          onOpen={header.openFolder}
          wrapItem={(folder, crumb) => (
            <FilesBreadcrumbDrop folder={folder}>{crumb}</FilesBreadcrumbDrop>
          )}
        />
      </PageHeader.Start>

      <PageHeader.End>
        <Input
          className="w-56"
          placeholder={t('search-files')}
          value={header.searchValue}
          onChange={(e) => header.setSearchValue(e.target.value)}
        />
        <Separator.Inline />
        <FilesUsageMeter />
        <FilesDisplayControl />
        {header.canContribute && (
          <>
            <Button variant="secondary" onClick={header.newFolder}>
              <IconFolderPlus />
              {t('new-folder')}
            </Button>
            <Button onClick={() => inputRef.current?.click()}>
              <IconUpload />
              {t('upload')}
            </Button>
            <input
              ref={inputRef}
              type="file"
              multiple
              hidden
              onChange={(e) => {
                header.upload(Array.from(e.target.files || []));
                e.target.value = '';
              }}
            />
          </>
        )}
      </PageHeader.End>
    </PageHeader>
  );
};
