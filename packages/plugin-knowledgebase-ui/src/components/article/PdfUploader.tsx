import { IPdfAttachment } from '@erxes/ui-knowledgeBase/src/types';
import Attachment from '@erxes/ui/src/components/Attachment';
import Spinner from '@erxes/ui/src/components/Spinner';
import { __, getEnv } from '@erxes/ui/src/utils';
import Alert from '@erxes/ui/src/utils/Alert';
import React, { useState, useEffect } from 'react';
import { AttachmentContainer, UploadBtn } from './styles';

type Props = {
  attachment?: IPdfAttachment;
  onChange: (attachment: IPdfAttachment | undefined) => void;
};

const PdfUploader = ({ attachment, onChange }: Props) => {
  const [isUploading, setIsUploading] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);

  // Extracted function to handle the common upload logic
  const uploadFileChunked = async (file: File) => {
    const CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB per chunk

    const { REACT_APP_API_URL } = getEnv();
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    let tempTaskId = taskId;

    try {
      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(file.size, start + CHUNK_SIZE);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append('file', chunk);
        formData.append('chunkIndex', i.toString());
        formData.append('totalChunks', totalChunks.toString());
        formData.append('filename', file.name);
        if (tempTaskId) {
          formData.append('taskId', tempTaskId);
        }

        const res = await fetch(`${REACT_APP_API_URL}/pl-workers/upload-pdf`, {
          method: 'POST',
          body: formData,
          credentials: 'include',
          headers: {
            Accept: 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });

        const result = await res.json();

        if (result.error) {
          Alert.error(result.error);
          setIsUploading(false);
          return;
        }

        if (i === 0 && result.taskId) {
          tempTaskId = result.taskId;
          setTaskId(result.taskId); // Set global taskId for potential future use
        }
      }

      Alert.warning(
        'Task has been submitted. Do not close or refresh until finished'
      );
    } catch (error) {
      Alert.error(error.message || 'Upload failed');
    }
  };

  const handlePdfUpload = async ({
    target,
  }: React.ChangeEvent<HTMLInputElement>) => {
    const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30 MB max for chunking

    const { files } = target;
    const file = files ? files[0] : null;

    if (!file) return;

    const { REACT_APP_API_URL } = getEnv();

    setIsUploading(true);

    try {
      if (file.size < MAX_FILE_SIZE) {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(`${REACT_APP_API_URL}/pl-workers/upload-pdf`, {
          method: 'POST',
          body: formData,
          credentials: 'include',
          headers: {
            Accept: 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });

        const result = await res.json();

        if (result.error) {
          Alert.error(result.error);
          setIsUploading(false);
          return;
        }

        setTaskId(result.taskId);
      } else {
        await uploadFileChunked(file);
      }
    } catch (error) {
      Alert.error(`Error: ${error.message || 'Failed to upload file'}`);
      setIsUploading(false);
    }
  };

  const checkTaskStatus = async (taskId: string) => {
    const { REACT_APP_API_URL } = getEnv();
    try {
      const res = await fetch(
        `${REACT_APP_API_URL}/pl-workers/upload-status/${taskId}`
      );
      const result = await res.json();

      if (result.status === 'completed') {
        Alert.success('Upload completed successfully!');
        setTaskId(null);
        setIsUploading(false);

        const pdfAttachment: IPdfAttachment = {
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
        };

        onChange(pdfAttachment);
        await fetch(`${REACT_APP_API_URL}/pl-workers/delete-task/${taskId}`, {
          method: 'DELETE',
          credentials: 'include',
        });
      } else if (result.status === 'failed') {
        Alert.error('Task failed to complete.');
        setTaskId(null);
        setIsUploading(false);
      }
    } catch (error) {
      Alert.error(`Error: ${error.message || 'Failed to fetch status'}`);
      setTaskId(null);
      setIsUploading(false);
    }
  };

  const handleDeleteAttachment = async () => {
    if (!attachment) return;
    setIsUploading(true);

    try {
      await Promise.all(
        attachment.pages.map((page) => deleteFile({ fileName: page.name }))
      );
      await deleteFile({ fileName: attachment.pdf.name });
      onChange(undefined);
      Alert.success('PDF attachment removed');
    } catch (error) {
      Alert.error(`Deletion failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const deleteFile = async ({ fileName }: { fileName: string }) => {
    const { REACT_APP_API_URL } = getEnv();
    const url = `${REACT_APP_API_URL}/pl:core/delete-file`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      body: `fileName=${fileName}`,
      credentials: 'include',
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text);
    }
    return response.text();
  };

  useEffect(() => {
    if (taskId) {
      const intervalId = setInterval(() => checkTaskStatus(taskId), 10000);
      return () => clearInterval(intervalId);
    }
  }, [taskId]);

  if (attachment) {
    return (
      <AttachmentContainer>
        <Attachment
          attachment={attachment.pdf}
          additionalItem={
            <>
              <p>{__('Number of pages') + ` (${attachment.pages.length})`}</p>
              <a onClick={handleDeleteAttachment}>{__('Delete')}</a>
            </>
          }
        />
      </AttachmentContainer>
    );
  }

  return (
    <UploadBtn>
      {isUploading && <Spinner />}
      <label>
        {__('Upload a PDF')}
        <input
          type='file'
          multiple={false}
          onChange={handlePdfUpload}
          accept='application/pdf'
        />
      </label>
    </UploadBtn>
  );
};

export default PdfUploader;
