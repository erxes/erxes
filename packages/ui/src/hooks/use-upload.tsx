import { useState } from 'react';
import { errorMessage, removeStoredFile, storeFile } from '../utils/file-storage';
import { useToast } from './use-toast';

type UploadedFileInfo = {
  name: string;
  size: number;
  type: string;
  duration: number;
};

type UploadOptions = {
  files: FileList | null;
  beforeUpload?: () => void;
  afterUpload: (params: { status: 'ok'; response: string; fileInfo: UploadedFileInfo }) => void;
  /** Gets each file as a data URL, for a preview while it uploads. */
  afterRead?: (params: { result: FileReader['result']; fileInfo: UploadedFileInfo }) => void;
};

type RemoveOptions = {
  fileName: string;
  afterRemove: (params: { status: string }) => void;
};

// Browsers give Hangul Word Processor files no type.
const typeOf = (file: File) => {
  if (file.name.endsWith('.hwp')) return 'application/haansoft-hwp';

  if (file.name.endsWith('.hwpx')) return 'application/haansoft-hwpml';

  return file.type;
};

const fileInfoOf = (file: File): UploadedFileInfo => ({
  name: file.name,
  size: file.size,
  type: typeOf(file),
  duration: 0,
});

const readAsDataUrl = (file: File, done: (result: FileReader['result']) => void) => {
  const reader = new FileReader();

  reader.onloadend = () => done(reader.result);
  reader.readAsDataURL(file);
};

/** Uploads files to the host's file storage, one request per file. */
export const useUpload = () => {
  const [status, setStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const uploadOne = async (file: File, afterUpload: UploadOptions['afterUpload']) => {
    const fileInfo = fileInfoOf(file);

    try {
      const address = await storeFile(file);

      setStatus(true);
      afterUpload({ status: 'ok', response: address, fileInfo });
    } catch (error) {
      setStatus(false);
      toast({
        title: 'Error uploading file',
        description: errorMessage(error, 'Upload failed'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const upload = ({ files, beforeUpload, afterUpload, afterRead }: UploadOptions) => {
    if (!files?.length) return;

    setIsLoading(true);

    for (const file of Array.from(files)) {
      beforeUpload?.();
      void uploadOne(file, afterUpload);

      if (afterRead) {
        readAsDataUrl(file, (result) => afterRead({ result, fileInfo: fileInfoOf(file) }));
      }
    }
  };

  const remove = async ({ fileName, afterRemove }: RemoveOptions) => {
    setIsLoading(true);

    try {
      await removeStoredFile(fileName);
      afterRemove({ status: 'ok' });
    } catch (error) {
      afterRemove({ status: errorMessage(error, 'Delete failed') });
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, status, upload, remove };
};
