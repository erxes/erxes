import { IconFile, IconX } from '@tabler/icons-react';
import { REACT_APP_API_URL } from 'erxes-ui';

import { IAttachment } from '@/deals/types/attachments';
import { useAttachmentContext } from './AttachmentContext';
import { useDealsContext } from '@/deals/context/DealContext';
import { useTranslation } from 'react-i18next';

const getAttachmentFileUrl = ({ url, name }: IAttachment) => {
  if (/^(https?:)?\/\//.test(url)) {
    return url;
  }

  const params = new URLSearchParams({ key: url });

  if (name) {
    params.set('name', name);
  }

  return `${REACT_APP_API_URL}/read-file?${params.toString()}`;
};

const FileAttachments = ({ attachments }: { attachments: IAttachment[] }) => {
  const { handleRemoveImage, removingUrl } = useAttachmentContext();
  const { loading } = useDealsContext();
  const { t } = useTranslation('sales');

  return (
    <div className="flex flex-wrap gap-2">
      {attachments.map((attachment) => (
        <div
          key={attachment.url}
          className="group flex h-8 items-center gap-2 rounded-md border bg-muted/40 pl-2.5 pr-1.5 text-sm"
        >
          <IconFile size={16} className="shrink-0 text-muted-foreground" />
          <a
            href={getAttachmentFileUrl(attachment)}
            target="_blank"
            rel="noreferrer"
            className="max-w-44 truncate font-medium hover:underline"
          >
            {attachment.name}
          </a>
          <button
            type="button"
            disabled={loading && removingUrl === attachment.url}
            onClick={(e) => handleRemoveImage(e, attachment)}
            className="flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-destructive hover:text-white"
            aria-label={t('remove-image', { name: attachment.name })}
          >
            <IconX size={12} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default FileAttachments;
