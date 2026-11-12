import type { ThreadStore, User } from '@blocknote/core/comments';
import type { Block } from '@blocknote/core';
import { useCreateBlockNote } from '@blocknote/react';
import { useCallback, useEffect } from 'react';
import { useErxesUpload } from 'erxes-ui/hooks/use-upload-new';
import { useUploadChunked } from 'erxes-ui/hooks/use-upload-chunked';
import { useToast } from 'erxes-ui/hooks/use-toast';
import { readImage } from 'erxes-ui/utils/core';
import { BLOCK_SCHEMA, TABLE_SCHEMA } from 'erxes-ui/modules/blocks/constant/blockEditorSchema';
import type { IBlockEditor } from 'erxes-ui/modules/blocks/types/TextEditor';
import { removeCodeFormattingFromHTML } from 'erxes-ui/modules/blocks/utils/removeCodeFormattingFromHTML';

export const useBlockEditor = (args?: {
  initialContent?: Block[];
  placeholder?: string;
  uploadFile?: (file: File) => Promise<string>;
  comments?: { threadStore: ThreadStore };
  resolveUsers?: (userIds: string[]) => Promise<User[]>;
}): IBlockEditor => {
  const { placeholder, uploadFile, ...restArgs } = args || {};

  const { uploadFile: uploadEditorFile } = useErxesUpload({ maxFiles: 1 });
  const { upload: uploadVideo, error: videoUploadError } = useUploadChunked();
  const { toast } = useToast();

  useEffect(() => {
    if (videoUploadError) {
      toast({
        title: 'Video upload failed',
        description: videoUploadError,
        variant: 'destructive',
      });
    }
  }, [videoUploadError, toast]);

  const defaultUploadFile = useCallback(
    async (file: File): Promise<string> => {
      if (file.type.startsWith('video/')) {
        const video = await uploadVideo(file);

        if (!video?.url) {
          throw new Error('Video upload failed');
        }

        return video.url;
      }

      const result = await uploadEditorFile(file);

      if (!result.url) {
        throw new Error(result.message || 'Upload failed');
      }

      return result.url;
    },
    [uploadEditorFile, uploadVideo],
  );

  const editor = useCreateBlockNote(
    {
      schema: BLOCK_SCHEMA,
      tables: TABLE_SCHEMA,
      placeholders: {
        default: placeholder || "Type '/' for commands...",
      },
      uploadFile: uploadFile ?? defaultUploadFile,
      resolveFileUrl: (url) => Promise.resolve(readImage(url)),
      ...restArgs,
    },
    [restArgs.comments?.threadStore],
  );

  useEffect(() => {
    const exportHTML = editor.blocksToHTMLLossy;
    editor.blocksToHTMLLossy = async (blocks) =>
      removeCodeFormattingFromHTML(await exportHTML.call(editor, blocks));

    return () => {
      editor.blocksToHTMLLossy = exportHTML;
    };
  }, [editor]);

  return editor;
};
