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
      <MailyEditor
        contentJson={contentJson}
        blocks={blocks}
        extensions={extensions}
        onCreate={onCreate}
        onUpdate={(editor) => onChange?.(editor.getJSON())}
      />
    </div>
  );
};
