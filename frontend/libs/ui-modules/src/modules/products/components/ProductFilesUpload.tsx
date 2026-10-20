import { IconPaperclip, IconTrash } from '@tabler/icons-react';
import { cn, formatBytes } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { FilePicker } from '../../files/components/FilePicker';
import { FileTypeIcon } from '../../files/components/FileTypeIcon';
import { filesCanManage } from '../../files/utils/roles';
import {
  productFileKey,
  ProductFileItem,
  useProductFiles,
} from '../hooks/useProductFiles';

export const ProductFilesUpload = ({
  value,
  onChange,
}: {
  value: ProductFileItem[];
  onChange: (next: ProductFileItem[]) => void;
}) => {
  const { t } = useTranslation('product', { keyPrefix: 'files' });
  const files = useProductFiles({ value, onChange });

  return (
    <div className="flex flex-col gap-3 min-w-0">
      <div className="flex flex-wrap gap-4 content-start min-w-0">
        {value.map((item) => {
          const key = productFileKey(item);
          const body = (
            <>
              <FileTypeIcon mimeType={item.type} className="size-6" />
              <span className="w-full text-[11px] text-center truncate">
                {item.name}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {item.url ? formatBytes(item.size) : t('pending')}
              </span>
            </>
          );
          const tileClass =
            'flex flex-col gap-1 justify-center items-center p-2 w-full h-full rounded-md';

          return (
            <div
              key={key}
              className={cn(
                'relative w-24 h-24 rounded-md border shadow-sm shrink-0 group bg-background',
                !item.url && 'border-dashed',
              )}
            >
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={item.name}
                  className={cn(tileClass, 'hover:bg-accent')}
                >
                  {body}
                </a>
              ) : (
                <div title={t('pending-hint')} className={tileClass}>
                  {body}
                </div>
              )}
              <button
                type="button"
                aria-label={t('remove')}
                onClick={() => files.remove(key)}
                className="absolute top-1 right-1 p-1 text-white rounded-md shadow opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100 bg-destructive"
              >
                <IconTrash size={14} />
              </button>
            </div>
          );
        })}

        {files.canAdd && (
          <button
            type="button"
            onClick={() => files.setPickerOpen(true)}
            className="flex flex-col justify-center items-center w-24 h-24 rounded-md border border-dashed transition cursor-pointer shrink-0 text-muted-foreground bg-background hover:bg-accent"
          >
            <IconPaperclip size={18} />
            <span className="text-[11px]">{t('add')}</span>
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
