import '@maily-to/core/style.css';
import { BROADCAST_PLACEHOLDERS, type BroadcastPlaceholder } from '@erxes/core-contract';
import { Editor } from '@maily-to/core';
import {
  blockquote,
  bulletList,
  button,
  clearLine,
  columns,
  divider,
  footer,
  hardBreak,
  heading1,
  heading2,
  heading3,
  image,
  inlineImage,
  orderedList,
  section,
  spacer,
  text,
} from '@maily-to/core/blocks';
import {
  ImageUploadExtension,
  SlashCommandExtension,
  VariableExtension,
} from '@maily-to/core/extensions';
import { useToast } from 'erxes-ui';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { uploadErrorMessage, uploadFile } from '~/lib/files';
import type { EmailNode } from './emailDocument';
import { LabelRow } from './PlaceholderMenu';

/** Uploads a picture as a public file, which any mail client can show. */
const uploadPicture = async (file: File, onProgress: (fraction: number) => void) => {
  const { publicUrl } = await uploadFile(file, {
    public: true,
    onProgress: (percent) => onProgress(percent / 100),
  });

  if (!publicUrl) throw new Error('The picture has no public address');

  return publicUrl;
};

/** The editor's blocks, without raw HTML and repeated blocks, which core won't send. */
const BLOCKS = [
  text,
  heading1,
  heading2,
  heading3,
  bulletList,
  orderedList,
  blockquote,
  image,
  inlineImage,
  divider,
  spacer,
  section,
  columns,
  button,
  footer,
  hardBreak,
  clearLine,
];

/**
 * The email's message in the maily editor: "/" adds blocks and pictures, "{{" or Insert a
 * field adds a customer's value with its fallback. Kept as the editor's document, which
 * core renders and sends; the editor follows `value` when it changes from outside.
 */
export const EmailEditor = ({
  value,
  onChange,
  label,
}: {
  value: EmailNode | null;
  onChange: (content: EmailNode) => void;
  label: string;
}) => {
  const { t } = useTranslation('broadcasts');
  const { toast } = useToast();
  const root = useRef<Editor.Root.Handle>(null);

  const fieldOf = (name: BroadcastPlaceholder) => ({
    id: name,
    label: t(`placeholder.${name}`, name),
    isDefaultEditable: true,
  });

  // Built once: a new list each render would make the editor reconfigure.
  const [extensions] = useState(() => [
    SlashCommandExtension.configure({
      commands: [{ title: t('blocks', 'Blocks'), commands: BLOCKS }],
    }),
    VariableExtension.configure({
      isIdEditable: false,
      variables: ({ query }) =>
        BROADCAST_PLACEHOLDERS.map(fieldOf).filter(({ id, label: name }) =>
          [id, name].some((word) => word.toLowerCase().startsWith(query.toLowerCase())),
        ),
    }),
    ImageUploadExtension.configure({
      onImageUpload: (file, { setProgress }) => uploadPicture(file, setProgress),
      onImageUploadError: (error, _file, { removeImage }) => {
        removeImage();
        toast({
          title: t('picture-failed', 'The picture couldn’t be uploaded'),
          description: uploadErrorMessage(error),
          variant: 'destructive',
        });
      },
    }),
  ]);

  const insertField = (name: BroadcastPlaceholder) =>
    root.current?.getEditor().chain().focus().insertVariable(fieldOf(name)).run();

  return (
    <fieldset aria-label={label} className="min-w-0 space-y-1.5">
      <LabelRow label={label} onPick={insertField} />
      <div className="min-h-64 overflow-hidden rounded-md bg-white text-sm text-neutral-900 shadow-xs scheme-light focus-within:shadow-focus">
        <Editor.Root
          ref={root}
          content={value ?? undefined}
          extensions={extensions}
          editorProps={{
            attributes: { role: 'textbox', 'aria-multiline': 'true', 'aria-label': label },
          }}
          onUpdate={() => {
            const content = root.current?.getJSON();

            if (content) onChange(content);
          }}
        >
          <Editor.Frame>
            <Editor.Content />
            <Editor.BubbleMenus />
            <Editor.DragContextHandle />
          </Editor.Frame>
        </Editor.Root>
      </div>
    </fieldset>
  );
};
