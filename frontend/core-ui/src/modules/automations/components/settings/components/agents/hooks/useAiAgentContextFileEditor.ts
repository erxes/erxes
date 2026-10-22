import {
  ensureContextFileName,
  getContextFileBaseName,
  TAiAgentContextFile,
  TAiAgentContextFileVersion,
} from '@/automations/components/settings/components/agents/utils/contextFiles';
import { REACT_APP_API_URL, toast } from 'erxes-ui';
import { useCallback, useEffect, useRef, useState } from 'react';

const readContextFile = async (
  file: TAiAgentContextFile | TAiAgentContextFileVersion,
) => {
  const response = await fetch(
    `${REACT_APP_API_URL}/read-file?key=${encodeURIComponent(file.key)}`,
    { credentials: 'include' },
  );
  const text = await (await response.blob()).text();

  if (!response.ok) {
    throw new Error(text || 'Failed to load context file');
  }

  return text;
};

const uploadContextFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${REACT_APP_API_URL}/upload-file?kind=main`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });
  const key = await response.text();

  if (!response.ok) {
    throw new Error(key || 'Failed to upload context file');
  }

  return key;
};

const getContextFileMimeType = (name: string, currentType?: string) => {
  if (name.toLowerCase().endsWith('.txt')) {
    return 'text/plain';
  }

  return currentType?.trim() || 'text/markdown';
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Please try again.';

/**
 * Loads a context file (or one of its versions) for editing and saves edits as
 * a new upload, so the previous key stays in version history.
 */
export const useAiAgentContextFileEditor = ({
  file,
  onSave,
}: {
  file: TAiAgentContextFile;
  onSave: (file: TAiAgentContextFile) => void;
}) => {
  const [name, setName] = useState(getContextFileBaseName(file.name));
  const [content, setContent] = useState('');
  const [savedContent, setSavedContent] = useState('');
  const [loadedKey, setLoadedKey] = useState(file.key);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const requestIdRef = useRef(0);

  const loadSource = useCallback(
    async (source: TAiAgentContextFile | TAiAgentContextFileVersion) => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      setLoadedKey(source.key);
      setIsLoading(true);

      try {
        const text = await readContextFile(source);

        if (requestIdRef.current === requestId) {
          setContent(text);
          setSavedContent(text);
        }
      } catch (error) {
        if (requestIdRef.current === requestId) {
          toast({
            title: 'Failed to load context file',
            description: getErrorMessage(error),
            variant: 'destructive',
          });
          setContent('');
        }
      } finally {
        if (requestIdRef.current === requestId) {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  // The form hands over a fresh object on every change; reload only when
  // another file or a newly saved version is opened.
  const fileRef = useRef(file);
  fileRef.current = file;

  useEffect(() => {
    setName(getContextFileBaseName(fileRef.current.name));
    void loadSource(fileRef.current);
  }, [file.id, file.key, loadSource]);

  const save = async () => {
    setIsSaving(true);

    try {
      const nextName = ensureContextFileName(name, file.name);
      const nextFile = new File([content], nextName, {
        type: getContextFileMimeType(nextName, file.type),
      });
      const key = await uploadContextFile(nextFile);

      onSave({
        ...file,
        key,
        name: nextName,
        size: nextFile.size,
        type: nextFile.type,
        uploadedAt: new Date().toISOString(),
      });
      setSavedContent(content);
      toast({ title: 'Context file saved', variant: 'success' });
    } catch (error) {
      toast({
        title: 'Failed to save context file',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    name,
    setName: (value: string) => setName(getContextFileBaseName(value)),
    content,
    setContent,
    isDirty:
      content !== savedContent || name !== getContextFileBaseName(file.name),
    isLoading,
    isSaving,
    loadedKey,
    loadSource,
    save,
  };
};
