import {
  IconForms,
  IconFile,
  IconFileCode,
  IconFileSpreadsheet,
  IconFileText,
  IconFileZip,
  IconPdf,
} from '@tabler/icons-react';
import { IMessage } from '../../types/Conversation';
import { IFormWidgetItem } from '../../types/FormWidget';
import { useTranslation } from 'react-i18next';
import {
  Avatar,
  Input,
  Label,
  RelativeDateDisplay,
  Textarea,
  Upload,
  cn,
  readImage,
} from 'erxes-ui';

type FileVariant =
  | 'image'
  | 'text'
  | 'pdf'
  | 'spreadsheet'
  | 'archive'
  | 'code'
  | 'other';

const getFileVariant = (url: string): FileVariant => {
  const ext = url.split('?')[0].split('.').pop()?.toLowerCase() ?? '';
  if (/^(jpg|jpeg|png|gif|webp|svg|bmp|ico|avif|tiff?)$/.test(ext))
    return 'image';
  if (/^(txt|md|log|csv|tsv)$/.test(ext)) return 'text';
  if (ext === 'pdf') return 'pdf';
  if (/^(xls|xlsx|ods|numbers)$/.test(ext)) return 'spreadsheet';
  if (/^(zip|tar|gz|rar|7z|bz2)$/.test(ext)) return 'archive';
  if (/^(js|ts|jsx|tsx|json|xml|html|css|py|rb|go|rs|java|c|cpp|sh)$/.test(ext))
    return 'code';
  return 'other';
};

const FileVariantIcon = ({
  variant,
  className,
}: {
  variant: FileVariant;
  className?: string;
}) => {
  const props = { className };
  switch (variant) {
    case 'pdf':
      return <IconPdf {...props} />;
    case 'text':
      return <IconFileText {...props} />;
    case 'spreadsheet':
      return <IconFileSpreadsheet {...props} />;
    case 'archive':
      return <IconFileZip {...props} />;
    case 'code':
      return <IconFileCode {...props} />;
    default:
      return <IconFile {...props} />;
  }
};

const TICKET_FIELD_LABELS: Record<string, string> = {
  'ticket:name': 'Ticket name',
  'ticket:description': 'Description',
};

const normalizeFormWidgetData = (
  data: IFormWidgetItem[] | Record<string, string> | null | undefined,
): IFormWidgetItem[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  // Legacy object format: { "ticket:name": "...", "ticket:description": "..." }
  return Object.entries(data).map(([key, value]) => ({
    _id: key,
    type: key === 'ticket:description' ? 'textarea' : 'input',
    text: TICKET_FIELD_LABELS[key] || key,
    value: String(value),
    column: 6,
  }));
};

export const ConversationFormDisplay = ({
  content,
  formWidgetData,
  createdAt,
}: IMessage) => {
  const { t } = useTranslation('frontline');
  const items = normalizeFormWidgetData(
    formWidgetData as IFormWidgetItem[] | Record<string, string> | null,
  );
  return (
    <div className="flex flex-col gap-2 relative flex-1 mt-8">
      <div className="flex flex-col bg-muted rounded-t-lg rounded-b-2xl p-2">
        <div className="px-3 pb-2 flex items-center gap-2 text-primary">
          <IconForms size={24} />
          <span className="text-sm font-semibold">{content}</span>
        </div>
        <div className="bg-background p-4 rounded-lg grid grid-cols-6 gap-6">
          {items.map((item: IFormWidgetItem) => (
            <div
              key={item._id}
              className={cn(
                'col-span-6 flex flex-col gap-2',
                item.column === 6 && 'col-span-6',
                item.column === 5 && 'col-span-5',
                item.column === 4 && 'col-span-4',
                item.column === 3 && 'col-span-3',
                item.column === 2 && 'col-span-2',
                item.column === 1 && 'col-span-1',
              )}
            >
              <Label>{item.text}</Label>
              {item.type !== 'file' && item.type !== 'core:customer:avatar' ? (
                item.value.length > 60 ? (
                  <Textarea value={item.value} />
                ) : (
                  <Input value={item.value} />
                )
              ) : null}
              {item.type === 'file' && (
                <div className="flex items-center overflow-x-auto hide-scroll snap-x">
                  {Array.isArray(item.value) &&
                    item.value.map((url, i) => {
                      const variant = getFileVariant(url);
                      const resolvedUrl = readImage(decodeURIComponent(url));

                      if (variant === 'image') {
                        return (
                          <Upload.Root
                            key={i}
                            value={url}
                            className="w-full"
                            onChange={() => {}}
                          >
                            <Upload.Preview />
                            <Upload.Button
                              size="sm"
                              variant="outline"
                              type="button"
                              className="items-center gap-1 cursor-pointer text-sm w-full justify-center hidden"
                            >
                              {t('view-attachments')}
                            </Upload.Button>
                          </Upload.Root>
                        );
                      }
                      return (
                        <a
                          key={`${url}-${i}`}
                          href={resolvedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-6 h-6 min-w-6 min-h-6 rounded border bg-muted shadow-sm text-muted-foreground hover:text-primary transition-colors snap-start"
                          title={url.split('/').pop()}
                        >
                          <FileVariantIcon
                            variant={variant}
                            className="w-4 h-4"
                          />
                        </a>
                      );
                    })}
                </div>
              )}
              {item.type === 'core:customer:avatar' && (
                <Avatar size={'xl'}>
                  <Avatar.Image
                    src={readImage(String(item.value))}
                    alt="avatar"
                  />
                  <Avatar.Fallback>C</Avatar.Fallback>
                </Avatar>
              )}
            </div>
          ))}
        </div>
      </div>
      <span className="absolute -bottom-5 font-medium right-2 text-xs text-accent-foreground">
        <RelativeDateDisplay value={createdAt} />
      </span>
    </div>
  );
};
