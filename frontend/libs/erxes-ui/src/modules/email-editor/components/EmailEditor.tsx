import '@maily-to/core/style.css';

import { Editor as MailyEditor } from '@maily-to/core';
import {
  getVariableSuggestions,
  HTMLCodeBlockExtension,
  ImageUploadExtension,
  MailyKit,
  PlaceholderExtension,
  VariableExtension,
} from '@maily-to/core/extensions';
import type { AnyExtension } from '@tiptap/core';
import { cn } from 'erxes-ui/lib';
import { readImage, REACT_APP_API_URL } from 'erxes-ui/utils';
import { DEFAULT_EMAIL_BLOCKS } from '../constant';
import { EmailEditorProps } from '../types';

export const uploadEmailEditorImage = async (file: File) => {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files can be uploaded');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${REACT_APP_API_URL}/upload-file?kind=main`, {
    method: 'post',
    body: formData,
    credentials: 'include',
  });

  const fileKey = await response.text();

  if (!response.ok || !fileKey) {
    throw new Error(fileKey || 'Failed to upload image');
  }

  return readImage(fileKey);
};

export const EmailEditor = ({
  contentJson,
  onChange,
  onCreate,
  variables,
  onImageUpload = uploadEmailEditorImage,
  blocks = DEFAULT_EMAIL_BLOCKS,
  extensions: additionalExtensions = [],
  placeholder,
  className,
}: EmailEditorProps) => {
  const extensions: AnyExtension[] = [
    MailyKit,
    HTMLCodeBlockExtension,
    ImageUploadExtension.configure({ onImageUpload }),
    VariableExtension.configure({
      suggestion: getVariableSuggestions('@'),
      variables: variables ?? [],
    }),
    PlaceholderExtension.configure({
      placeholder: placeholder || "Type '/' for commands, '@' for variables...",
    }),
    ...additionalExtensions,
  ];

  return (
    <div className={cn('w-full h-full', className)}>
      {/*
        Maily's slash/@/bubble menus are Tippy popups portaled straight to
        document.body, outside Radix's own Dialog/Sheet content tree. Radix
        sets body { pointer-events: none } while a Sheet is open as part of
        its scroll lock, and pointer-events inherits by default, so those
        popups silently lost all mouse interaction - not just scrolling,
        clicking any item too. This breaks the inherited "none" right at
        the Tippy root.
      */}
      <style>{'[data-tippy-root] { pointer-events: auto; }'}</style>
      <MailyEditor
        contentJson={contentJson}
        blocks={blocks}
        extensions={extensions}
        config={{
          hasMenuBar: false,
          contentClassName: 'px-6',
          bodyClassName: 'border-none! mt-0!',
        }}
        onCreate={(editor) => {
          // Tiptap's onUpdate only fires on edits, not on mount - without
          // this, a freshly-opened compose form has contentJson stuck at
          // undefined until the user types something, which breaks every
          // action (preview/copy/test-send) that reads it before that.
          onChange?.(editor.getJSON());
          onCreate?.(editor);
        }}
        onUpdate={(editor) => onChange?.(editor.getJSON())}
      />
    </div>
  );
};
