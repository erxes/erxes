import React, { useState, useEffect } from 'react';

import Attachment from '@erxes/ui/src/components/Attachment';
import Spinner from '@erxes/ui/src/components/Spinner';
import { __, getEnv } from '@erxes/ui/src/utils';
import Alert from '@erxes/ui/src/utils/Alert';

import { IPdfAttachment } from '@erxes/ui/src/types';
import { AttachmentContainer, UploadBtn } from '../styles/main';

// Utility for making API requests
const apiRequest = async (url: string, options: RequestInit) => {
  const response = await fetch(url, options);

  if (response.status === 524) {
    console.warn('Ignoring 524 Timeout error');

    const status = url.includes('upload-status') ? 'processing' : 'uploading';

    return { progress: 0, status };
  }

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
  const [status, setStatus] = useState('');
  const [uploadState, setUploadState] = useState({
    taskId: null as string | null,
    lastChunkUploaded: false,
  });

  const handleChunkedUpload = async (file: File) => {
    const { REACT_APP_API_URL } = getEnv();
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const chunkProgress = 100 / totalChunks;
    let taskId = uploadState.taskId || '';
    let chunkNumber = 0;
    let start = 0;
    let end = CHUNK_SIZE; // Initialize `end` to the chunk size

    const uploadNextChunk = async () => {
      if (start < file.size) {
        // Ensure we only process up to the file size
        const chunk = file.slice(start, end); // Get the current chunk
        const formData = new FormData();
        formData.append('file', chunk);
        formData.append('chunkIndex', chunkNumber.toString());
        formData.append('totalChunks', totalChunks.toString());
        formData.append('filename', file.name);
        formData.append('taskId', taskId);

        try {
          const response = await fetch(
            `${REACT_APP_API_URL}/pl-workers/upload-pdf`,
            {
              method: 'POST',
              body: formData,
              credentials: 'include',
            }
          );
          const data = await response.json();
          if (start === 0) {
            // Set the task ID only for the first chunk
            setUploadState((prevState) => ({
              ...prevState,
              taskId: data.taskId,
            }));
            taskId = data.taskId;
          }

          const progress = Math.min(100, (chunkNumber + 1) * chunkProgress);
          setStatus(`Uploading... ${progress.toFixed(2)} %`);

          // Update start and end for the next chunk
          chunkNumber++;
          start = end;
          end = Math.min(start + CHUNK_SIZE, file.size); // Ensure `end` does not exceed file size
          await uploadNextChunk(); // Recursively upload the next chunk
        } catch (error) {
          console.error('Error uploading chunk:', error);
          setStatus('Error uploading file. Please try again.');
        }
      } else {
        // All chunks uploaded
        setStatus('Processing pages...');
        setUploadState((prevState) => ({
          ...prevState,
          lastChunkUploaded: true,
        }));
      }
    };

    await uploadNextChunk(); // Start the upload process
  };

  const handleUpload = async ({
    target,
  }: React.ChangeEvent<HTMLInputElement>) => {
    const file = target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setStatus('Uploading...');
    try {
      if (file.size < MAX_FILE_SIZE) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('filename', file.name);
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

      const { progress } = result;

      switch (result.status) {
        case 'uploading':
          setStatus(`Processing pages... ${progress.toFixed(2)} %`);
          break;
        case 'completed':
          setStatus('Upload complete!');
          Alert.success('Upload complete!');
          setUploadState({ taskId: null, lastChunkUploaded: false });
          onChange({
            pages: result.data.pages.map((page: string, index: number) => ({
              name: `page-${index + 1}.jpg`,
              url: page,
              type: 'image/jpeg',
            })),
          });

          setIsUploading(false);
          break;
        case 'failed':
          setStatus('Upload failed.');
          Alert.error('Upload failed.');
          setUploadState({ taskId: null, lastChunkUploaded: false });
          break;
        default:
          setStatus('Processing pages...');
      }
    } catch (error) {
      Alert.error(`Status check failed: ${error.message}`);
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (uploadState.taskId && uploadState.lastChunkUploaded) {
      const interval = setInterval(checkStatus, 4000);
      return () => clearInterval(interval);
    }
  }, [uploadState.taskId, uploadState.lastChunkUploaded]);

  const renderAttachments = () => {
    if (!attachment || !attachment?.pages?.length) {
      return null;
    }
    return (
      <AttachmentContainer>
        <Attachment
          attachment={{
            name: 'PDF',
            url: '',
            type: 'application/pdf',
          }}
          additionalItem={
            <>
              <p>{`${__('Number of pages')}: ${attachment.pages?.length}`}</p>
              <a onClick={() => onChange(undefined)}>{__('Delete')}</a>
            </>
          }
        />
      </AttachmentContainer>
    );
  };

  const renderButton = () => {
    if (attachment && attachment?.pages?.length) {
      return null;
    }

    return (
      <UploadBtn>
        {isUploading ? (
          <>
            <p>{__(status)} </p>
            <Spinner size={20} />
          </>
        ) : (
          <label>
            {__('Upload a PDF')}
            <input
              type="file"
              accept="application/pdf"
              onChange={handleUpload}
            />
          </label>
        )}
      </UploadBtn>
    );
  };

  return (
    <>
      {renderAttachments()}
      {renderButton()}
    </>
  );
};

export default PdfUploader;
