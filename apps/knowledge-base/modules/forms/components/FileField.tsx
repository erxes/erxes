'use client';

import { useRef, useState } from 'react';
import { readPortalEnv } from '@/modules/apollo/utils/env';
import { Button } from '@/modules/ui/components/Button';
import { Icon } from '@/modules/ui/components/Icon';
import type { FormAttachment } from '../types';
import type { FormValue } from '../utils/fields';
import { readableSize, uploadFormFile } from '../utils/upload';

const asFiles = (value: FormValue): FormAttachment[] =>
  Array.isArray(value)
    ? value.filter((entry): entry is FormAttachment => typeof entry === 'object')
    : [];

export const FileField = ({
  value,
  onChange,
}: {
  value: FormValue;
  onChange: (next: FormValue) => void;
}) => {
  const { apiUrl } = readPortalEnv();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const files = asFiles(value);

  const add = async (picked: FileList | null) => {
    if (!picked?.length) {
      return;
    }

    setBusy(true);
    setFailure(null);

    try {
      const uploaded = await Promise.all(
        Array.from(picked).map((file) => uploadFormFile(file, apiUrl)),
      );

      onChange([...files, ...uploaded]);
    } catch (caught) {
      setFailure(
        caught instanceof Error ? caught.message : 'Файлыг байршуулж чадсангүй.',
      );
    } finally {
      setBusy(false);

      /* Cleared so picking the same file again still fires a change. */
      if (input.current) {
        input.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-3">
      {files.length ? (
        <ul className="space-y-2">
          {files.map((file) => (
            <li
              key={file.url}
              className="flex items-center gap-3 rounded-lg border border-line bg-white px-3.5 py-2.5"
            >
              <Icon name="paperclip" size={16} className="shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-ink">
                  {file.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {readableSize(file.size)}
                </span>
              </span>
              <button
                type="button"
                aria-label={`${file.name} устгах`}
                onClick={() =>
                  onChange(files.filter((entry) => entry.url !== file.url))
                }
                className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-subtle hover:text-danger"
              >
                <Icon name="close" size={15} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <input
        ref={input}
        type="file"
        multiple
        className="hidden"
        onChange={(event) => void add(event.target.files)}
      />

      <Button
        variant="secondary"
        size="sm"
        disabled={busy}
        onClick={() => input.current?.click()}
      >
        <Icon name="paperclip" size={15} />
        {busy ? 'Байршуулж байна…' : 'Файл хавсаргах'}
      </Button>

      {failure ? (
        <p role="alert" className="text-[13px] text-danger">
          {failure}
        </p>
      ) : null}
    </div>
  );
};
