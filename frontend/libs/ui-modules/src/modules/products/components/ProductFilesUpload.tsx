import { IconPaperclip, IconTrash } from '@tabler/icons-react';
import { formatBytes, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { FilePicker } from '../../files/components/FilePicker';
import { FileTypeIcon } from '../../files/components/FileTypeIcon';
import { filesCanManage } from '../../files/utils/roles';
import { useProductFiles } from '../hooks/useProductFiles';
import { ProductAttachmentItem } from './ProductImageUploads';

export const ProductFilesUpload = ({
  value,
  onChange,
}: {
  value: ProductAttachmentItem[];
  onChange: (next: ProductAttachmentItem[]) => void;
}) => {
  const { t } = useTranslation('product', { keyPrefix: 'files' });
  const files = useProductFiles({ value, onChange });

  return (
    <div className="flex flex-col gap-3 min-w-0">
      <div className="flex flex-wrap gap-4 content-start min-w-0">
        {value.map((item) => (
          <div
            key={item.url}
            className="relative w-24 h-24 rounded-md border shadow-sm shrink-0 group bg-background"
          >
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              title={item.name}
              className="flex flex-col gap-1 justify-center items-center p-2 w-full h-full rounded-md hover:bg-accent"
            >
              <FileTypeIcon mimeType={item.type} className="size-6" />
              <span className="w-full text-[11px] text-center truncate">
                {item.name}
              </span>
              {!!item.size && (
                <span className="text-[10px] text-muted-foreground">
                  {formatBytes(item.size)}
                </span>
              )}
            </a>
            <button
              type="button"
              aria-label={t('remove')}
              onClick={() => files.remove(item.url)}
              className="absolute top-1 right-1 p-1 text-white rounded-md shadow opacity-0 transition group-hover:opacity-100 bg-destructive"
            >
              <IconTrash size={14} />
            </button>
          </div>
        ))}

        {files.canAdd && (
          <button
            type="button"
            onClick={() => files.setPickerOpen(true)}
            disabled={files.adding}
            className="flex flex-col justify-center items-center w-24 h-24 rounded-md border border-dashed transition cursor-pointer shrink-0 text-muted-foreground bg-background hover:bg-accent disabled:cursor-not-allowed disabled:opacity-70"
          >
            {files.adding ? (
              <Spinner size="sm" />
            ) : (
              <>
                <IconPaperclip size={18} />
                <span className="text-[11px]">{t('add')}</span>
              </>
            )}
          </button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">{t('public-hint')}</p>

      <FilePicker
        open={files.pickerOpen}
        onOpenChange={files.setPickerOpen}
        multiple
        accept={(file) => filesCanManage(file.myRole)}
        onSelect={files.add}
        title={t('pick-title')}
      />
    </div>
  );
};
