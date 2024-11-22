import React, { useState, useEffect } from 'react';
import { IPdfAttachment } from '@erxes/ui-knowledgeBase/src/types';
import Attachment from '@erxes/ui/src/components/Attachment';
import Spinner from '@erxes/ui/src/components/Spinner';
import { __, getEnv } from '@erxes/ui/src/utils';
import Alert from '@erxes/ui/src/utils/Alert';
import { AttachmentContainer, UploadBtn } from './styles';

// Utility for making API requests
const apiRequest = async (url: string, options: RequestInit) => {
  const response = await fetch(url, options);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Request failed');
  }
  return response.json();
};

// Constants
const CHUNK_SIZE = 5 * 1024 * 1024; // 10 MB per chunk
const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30 MB max for single upload

type Props = {
  attachment?: IPdfAttachment;
  onChange: (attachment: IPdfAttachment | undefined) => void;
};

const PdfUploader = ({ attachment, onChange }: Props) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadState, setUploadState] = useState({
    taskId: null as string | null,
    lastChunkUploaded: false,
  });

  const handleChunkedUpload = async (file: File) => {
    const { REACT_APP_API_URL } = getEnv();
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    let { taskId = '' } = uploadState;

    Alert.warning('Uploading... Do not close or refresh.');

    try {
      // Upload the first chunk to get the taskId
      const firstChunk = file.slice(0, CHUNK_SIZE);
      const formData = new FormData();
      formData.append('file', firstChunk);
      formData.append('chunkIndex', '0');
      formData.append('totalChunks', totalChunks.toString());
      formData.append('filename', file.name);

      const firstResult = await apiRequest(
        `${REACT_APP_API_URL}/pl-workers/upload-pdf`,
        {
          method: 'POST',
          body: formData,
          credentials: 'include',
        }
      );

      if (firstResult.taskId) {
        setUploadState((prev) => ({ ...prev, taskId: firstResult.taskId }));
        taskId = firstResult.taskId;
      } else {
        throw new Error('Failed to get taskId from the first chunk');
      }

      // Upload the remaining chunks asynchronously
      const uploadPromises: any[] = [];
      for (let i = 1; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(file.size, start + CHUNK_SIZE);
        const chunk = file.slice(start, end);

        const chunkFormData = new FormData();
        chunkFormData.append('file', chunk);
        chunkFormData.append('chunkIndex', i.toString());
        chunkFormData.append('totalChunks', totalChunks.toString());
        chunkFormData.append('filename', file.name);
        chunkFormData.append('taskId', String(taskId));

        const uploadPromise = apiRequest(
          `${REACT_APP_API_URL}/pl-workers/upload-pdf`,
          {
            method: 'POST',
            body: chunkFormData,
            credentials: 'include',
          }
        );

        uploadPromises.push(uploadPromise);
      }

      await Promise.all(uploadPromises); // Wait for all chunks to complete
      setUploadState((prev) => ({ ...prev, lastChunkUploaded: true }));
    } catch (error) {
      Alert.error(`Chunk upload failed: ${error.message}`);
      setIsUploading(false);
    }
  };

  const handleUpload = async ({
    target,
  }: React.ChangeEvent<HTMLInputElement>) => {
    const file = target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      if (file.size < MAX_FILE_SIZE) {
        const formData = new FormData();
        formData.append('file', file);

        const { REACT_APP_API_URL } = getEnv();
        const result = await apiRequest(
          `${REACT_APP_API_URL}/pl-workers/upload-pdf`,
          {
            method: 'POST',
            body: formData,
            credentials: 'include',
          }
        );
        
        if (result.error) {
          Alert.error(result.error);
          setIsUploading(false);
          return;
        }
        setUploadState((prev) => ({
          ...prev,
          taskId: result.taskId,
          lastChunkUploaded: true,
        }));
      } else {
        await handleChunkedUpload(file);
      }
    } catch (error) {
      Alert.error(`Upload failed: ${error.message}`);
      setIsUploading(false);
    }
  };

  const checkStatus = async () => {
    if (!uploadState.taskId || !uploadState.lastChunkUploaded) return;

    try {
      const { REACT_APP_API_URL } = getEnv();
      const result = await apiRequest(
        `${REACT_APP_API_URL}/pl-workers/upload-status/${uploadState.taskId}`,
        { method: 'GET' }
      );

      if (result.status === 'completed') {
        Alert.success('Upload complete!');
        setUploadState({ taskId: null, lastChunkUploaded: false });
        onChange({
          pdf: {
            name: result.filename,
            type: 'application/pdf',
            url: result.data.pdf,
          },
          pages: result.data.pages.map((page: string, index: number) => ({
            name: `page-${index + 1}.jpg`,
            url: page,
            type: 'image/jpeg',
          })),
        });

        setIsUploading(false);
      } else if (result.status === 'failed') {
        Alert.error('Upload failed.');
        setUploadState({ taskId: null, lastChunkUploaded: false });
      }
    } catch (error) {
      Alert.error(`Status check failed: ${error.message}`);
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (uploadState.taskId && uploadState.lastChunkUploaded) {
      const interval = setInterval(checkStatus, 10000);
      return () => clearInterval(interval);
    }
  }, [uploadState.taskId, uploadState.lastChunkUploaded]);

  return attachment ? (
    <AttachmentContainer>
      <Attachment
        attachment={attachment.pdf}
        additionalItem={
          <>
            <p>{`${__('Number of pages')}: ${attachment.pages.length}`}</p>
            <a onClick={() => onChange(undefined)}>{__('Delete')}</a>
          </>
        }
      />
    </AttachmentContainer>
  ) : (
    <UploadBtn>
      {isUploading ? (
        <>
          <p>Uploading, please wait! </p>
          <Spinner size={20} />
        </>
      ) : (
        <label>
          {__('Upload a PDF')}
          <input type='file' accept='application/pdf' onChange={handleUpload} />
        </label>
      )}
    </UploadBtn>
  );
};

export default PdfUploader;
