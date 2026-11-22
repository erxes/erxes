import { Label, readImage } from 'erxes-ui';
import type { IMessage } from '@/inbox/types/Conversation';
import {
  formatFormWidgetValue,
  getFormWidgetResource,
  normalizeFormWidgetData,
} from '@/inbox/conversation-messages/utils/formWidget';

const IMAGE_EXTENSION = /\.(jpg|jpeg|png|gif|webp|svg|bmp|avif)$/i;

const toResources = (value: unknown): string[] =>
  (Array.isArray(value) ? value : [value])
    .map(getFormWidgetResource)
    .filter((url): url is string => url !== undefined);

export const FormPrintView = ({
  content,
  formWidgetData,
  createdAt,
}: Pick<IMessage, 'content' | 'formWidgetData' | 'createdAt'>) => {
  const items = normalizeFormWidgetData(formWidgetData);

  return (
    <div className="flex flex-col gap-6 bg-white p-8 text-black">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold">{content}</h1>
        <span className="text-xs text-gray-500">
          {new Date(createdAt).toLocaleString()}
        </span>
      </div>
      <div className="flex flex-col gap-4">
        {items.map((item) => {
          const isResource =
            item.type === 'file' || item.type === 'core:customer:avatar';

          return (
            <div
              key={item._id}
              className="flex break-inside-avoid flex-col gap-2"
            >
              <Label>{item.text}</Label>
              {isResource ? (
                <div className="flex flex-wrap gap-2">
                  {toResources(item.value).map((url) =>
                    IMAGE_EXTENSION.test(url.split('?')[0]) ? (
                      <img
                        key={url}
                        src={readImage(url)}
                        alt=""
                        className="max-h-60 max-w-60 rounded-md object-contain"
                      />
                    ) : (
                      <span key={url} className="text-sm">
                        {url.split('/').pop()}
                      </span>
                    ),
                  )}
                </div>
              ) : (
                <div className="min-h-9 whitespace-pre-wrap break-words rounded-md border px-3 py-2 text-sm">
                  {formatFormWidgetValue(item.value)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
