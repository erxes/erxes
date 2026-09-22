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
import type { AnyExtension, Editor as TiptapEditor } from '@tiptap/core';
import { cn } from 'erxes-ui/lib';
import { readImage, REACT_APP_API_URL } from 'erxes-ui/utils';
import { useState } from 'react';
import { DEFAULT_EMAIL_BLOCKS } from '../constant';
import { EmailProductCardToolbar } from './EmailProductCardToolbar';
import { EmailTableToolbar } from './EmailTableToolbar';
import { EmailProductCard } from '../extensions/productCard';
import { EMAIL_TABLE_EXTENSIONS } from '../extensions/table';
import { EmailEditorProps } from '../types';

// Maily hands every empty node a placeholder (`includeChildren: true`) and
// returns '' for the ones that only hold other blocks. Replacing its option
// with a plain string gave a column and the paragraph inside it the same line
// of text, drawn on top of each other.
// `{` is how the rest of erxes offers record fields in an editor, so the email
// editor asks for them the same way.
const VARIABLE_TRIGGER = '{';

const CONTAINER_NODES = [
  'columns',
  'column',
  'section',
  'repeat',
  'show',
  'blockquote',
  'table',
  'tableRow',
  'tableCell',
  'tableHeader',
];

const nodePlaceholder =
  (placeholder: string) =>
  ({
    node,
  }: {
    node: { type: { name: string }; attrs: { level?: number } };
  }) => {
    if (CONTAINER_NODES.includes(node.type.name)) {
      return '';
    }

    if (node.type.name === 'heading') {
      return `Heading ${node.attrs.level}`;
    }

    if (node.type.name === 'htmlCodeBlock') {
      return 'Type your HTML code...';
    }

    return placeholder;
  };

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
  editable = true,
}: EmailEditorProps) => {
  const [editor, setEditor] = useState<TiptapEditor | null>(null);
  const extensions: AnyExtension[] = [
    MailyKit,
    HTMLCodeBlockExtension,
    ImageUploadExtension.configure({ onImageUpload }),
    VariableExtension.configure({
      suggestion: getVariableSuggestions(VARIABLE_TRIGGER),
      variables: variables ?? [],
    }),
    PlaceholderExtension.configure({
      placeholder: nodePlaceholder(
        placeholder ||
          `Type '/' for commands, '${VARIABLE_TRIGGER}' for fields...`,
      ),
    }),
    ...EMAIL_TABLE_EXTENSIONS,
    EmailProductCard,
    ...additionalExtensions,
  ];

  return (
    <div className={cn('w-full h-full', className)}>
      <style>
        {`
          [data-tippy-root] { pointer-events: auto; }

          [data-tippy-root] [data-radix-popper-content-wrapper][style*="z-index: 50;"] {
            display: none;
          }

          /* The placeholder marks every empty node, and an empty ::before on a
             row becomes an anonymous cell — which shifted the header row by a
             whole column. The paragraph inside a cell still carries its own. */
          #mly-editor table::before,
          #mly-editor tr::before,
          #mly-editor th::before,
          #mly-editor td::before {
            content: none !important;
          }
        `}
      </style>
      <MailyEditor
        editable={editable}
        contentJson={contentJson}
        blocks={blocks}
        extensions={extensions}
        config={{
          hasMenuBar: false,
          contentClassName: 'pl-16 pr-6',
          bodyClassName: 'border-none! mt-0!',
        }}
        onCreate={(created) => {
          onChange?.(created.getJSON());
          onCreate?.(created);
          setEditor(created);
        }}
        onUpdate={(updated) => onChange?.(updated.getJSON())}
      />

      {editable && (
        <div className="pointer-events-none sticky bottom-4 flex justify-center">
          <div className="pointer-events-auto flex gap-2">
            <EmailTableToolbar editor={editor} />
            <EmailProductCardToolbar editor={editor} />
          </div>
        </div>
      )}
    </div>
  );
};
