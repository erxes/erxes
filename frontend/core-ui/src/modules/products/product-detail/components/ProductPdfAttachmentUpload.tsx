import { IconFileTypePdf, IconTrash, IconUpload } from '@tabler/icons-react';
import { Button, Spinner, formatBytes, useToast, useUpload } from 'erxes-ui';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ProductAttachment, ProductPdfAttachment } from '../types/detailTypes';

/**
 * Reader PDF for products sold as e-books / magazines. The admin uploads one
 * PDF; on save the server renders it into `pdfAttachment.pages`, which the
 * storefront reader shows. Previous pages stay live until rendering finishes.
 *
 * `value` is only set once the admin changes the PDF, so saving the product
 * without touching this card never resends (or clears) existing pages.
 */
export const ProductPdfAttachmentUpload = ({
  current,
  value,
  onChange,
}: {
  current?: ProductPdfAttachment | null;
  value?: ProductPdfAttachment | null;
  onChange: (next: ProductPdfAttachment) => void;
}) => {
  const { t } = useTranslation('product', { keyPrefix: 'pdf-attachment' });
  const { toast } = useToast();
  const { upload, isLoading } = useUpload();
  const inputRef = useRef<HTMLInputElement>(null);

  const changed = value !== undefined;
  const shown = changed ? value : current;
  const pdf: ProductAttachment | undefined | null = shown?.pdf;
  const pageCount = current?.pages?.length || 0;
  const removed = changed && !value?.pdf?.url;

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) {
      toast({
        title: t('only-pdf', 'Only PDF files can be used'),
        variant: 'destructive',
      });
      return;
    }

    upload({
      files,
      afterUpload: ({ status, response, fileInfo }) => {
        if (status !== 'ok') {
          toast({
            title: t('upload-failed', 'Could not upload the PDF'),
            description: String(response || ''),
            variant: 'destructive',
          });
          return;
        }

        onChange({
          pdf: {
            url: response,
            name: fileInfo.name,
            type: 'application/pdf',
            size: fileInfo.size,
          },
        });
      },
    });

    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-3 min-w-0">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex flex-1 gap-3 items-center p-3 rounded-md border min-w-[240px] bg-background">
          <IconFileTypePdf className="size-8 shrink-0 text-destructive" />
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">
              {removed
                ? t('removed', 'PDF will be removed on save')
                : pdf?.name ||
                  (pageCount
                    ? t('pages-only', 'Reader pages (no source PDF stored)')
                    : t('empty', 'No PDF yet'))}
            </p>
            <p className="text-xs text-muted-foreground">
              {changed && !removed
                ? t(
                    'pending',
                    'Pages are generated after you save. Current pages stay visible until then.',
                  )
                : pageCount
                ? t('page-count', '{{count}} reader pages', {
                    count: pageCount,
                  })
                : pdf?.size
                ? formatBytes(pdf.size)
                : t('hint', 'Upload a PDF to create reader pages')}
            </p>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={() => inputRef.current?.click()}
        >
          {isLoading ? <Spinner size="sm" /> : <IconUpload />}
          {pdf?.url || pageCount
            ? t('replace', 'Replace PDF')
            : t('upload', 'Upload PDF')}
        </Button>
        {(pdf?.url || pageCount > 0) && !removed && (
          <Button
            type="button"
            variant="ghost"
            className="text-destructive"
            disabled={isLoading}
            onClick={() => onChange({ pdf: null, pages: [] })}
          >
            <IconTrash />
            {t('remove', 'Remove')}
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {t(
          'description',
          'Customers who bought this product read these pages in the storefront reader. Replacing the PDF keeps access for existing buyers.',
        )}
      </p>
    </div>
  );
};
