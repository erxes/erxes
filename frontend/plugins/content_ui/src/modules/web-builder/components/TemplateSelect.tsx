import { IconEye, IconWorldPlus, IconX } from '@tabler/icons-react';
import { Button, Dialog } from 'erxes-ui';
import { useState } from 'react';
import { TEMPLATES } from '../constants';

type Template = (typeof TEMPLATES)[number];

interface TemplateSelectProps {
  type: string;
  value: string;
  onChange: (id: string) => void;
}

export const TemplateSelect = ({
  type,
  value,
  onChange,
}: TemplateSelectProps) => {
  const [preview, setPreview] = useState<Template | null>(null);
  const templates = TEMPLATES.filter((t) => t.type === type);

  if (!type) {
    return (
      <p className="text-sm text-muted-foreground py-2">
        Select a template type first
      </p>
    );
  }

  if (!templates.length) {
    return (
      <p className="text-sm text-muted-foreground py-2">
        No templates available
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
        {templates.map((t) => (
          <div key={t.id} className="relative group">
            <button
              type="button"
              onClick={() => onChange(t.id)}
              className={[
                'w-full border rounded-lg overflow-hidden text-left hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20',
                value === t.id
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-border',
              ].join(' ')}
            >
              <div className="aspect-video bg-gray-100 overflow-hidden">
                {t.thumbnail ? (
                  <img
                    src={t.thumbnail}
                    alt={t.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <IconWorldPlus className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="px-2 py-1.5 text-xs font-medium truncate">
                {t.name}
              </div>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPreview(t);
              }}
              title="Preview"
              className="text-sm cursor-pointer flex gap-2 items-center text-white absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 hover:bg-black/80 rounded py-1 px-3"
            >
              <IconEye className="w-3 h-3 " />
              Preview
            </button>
          </div>
        ))}
      </div>

      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <Dialog.Content className="max-w-2xl p-0 overflow-hidden gap-0">
          <Dialog.Description className="sr-only">
            Template preview
          </Dialog.Description>

          <div className="aspect-video bg-gray-100 overflow-hidden">
            {preview?.thumbnail ? (
              <img
                src={preview.thumbnail}
                alt={preview.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <IconWorldPlus className="w-12 h-12 text-gray-300" />
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between mb-3">
              <Dialog.Title className="text-xl">{preview?.name}</Dialog.Title>
              <Dialog.Close asChild>
                <Button variant="ghost" size="icon" className="-mt-1 -mr-2">
                  <IconX className="w-4 h-4" />
                </Button>
              </Dialog.Close>
            </div>

            <p className="text-sm text-muted-foreground mb-5">
              {preview?.description}
            </p>

            {preview?.review && (
              <p className="text-sm text-gray-500 italic border-l-2 border-border pl-3 mb-5">
                "{preview.review}"
              </p>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Colors</span>
                <span
                  className="w-5 h-5 rounded-full border border-border"
                  style={{ background: preview?.primaryColor }}
                  title="Primary"
                />
                <span
                  className="w-5 h-5 rounded-full border border-border"
                  style={{ background: preview?.secondaryColor }}
                  title="Secondary"
                />
              </div>

              <Button
                onClick={() => {
                  if (preview) {
                    onChange(preview.id);
                    setPreview(null);
                  }
                }}
              >
                Use This Template
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog>
    </>
  );
};
