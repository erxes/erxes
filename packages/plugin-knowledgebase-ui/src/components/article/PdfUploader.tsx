import { IPdfAttachment } from '@erxes/ui-knowledgeBase/src/types';
import Attachment from '@erxes/ui/src/components/Attachment';
import Spinner from '@erxes/ui/src/components/Spinner';
import { __, getEnv } from '@erxes/ui/src/utils';
import Alert from '@erxes/ui/src/utils/Alert';
import React from 'react';
import { AttachmentContainer, UploadBtn } from './styles';

type Props = {
  attachment?: IPdfAttachment;
  onChange: (attachment: IPdfAttachment | undefined) => void;
};

const PdfUploader = (props: Props) => {
  const [isUploading, setIsUploading] = React.useState(false);
  const [taskId, setTaskId] = React.useState(null);

  const { attachment, onChange } = props;

  // Polling to check the upload task status
  const checkTaskStatus = async (taskId) => {
    const { REACT_APP_API_URL } = getEnv();
    try {
      const res = await fetch(`${REACT_APP_API_URL}/pl-workers/upload-status/${taskId}`);
      const result = await res.json();

      if (result.status === 'completed') {
        Alert.success('Upload completed successfully!');
        setTaskId(null); // Stop polling
        setIsUploading(false);
        const { data } = result;

        const pdfAttachment: IPdfAttachment = {
          pdf: {
            name: result.filename,
            type: 'application/pdf',
            url: data.pdf,
          },
          pages: data.pages.map((page, index) => ({
            name: `page-${index + 1}.jpg`,
            url: page,
            type: 'image/jpeg',
          })),
        };

        onChange(pdfAttachment);

        fetch(`${REACT_APP_API_URL}/pl-workers/delete-task/${taskId}`, {
          method: 'DELETE',
          credentials: 'include',
        });
      } else if (result.status === 'failed') {
        Alert.error('Task failed to complete.');
      
        setTaskId(null); // Stop polling
        setIsUploading(false);
      } else {
        setIsUploading(true);
      }
    } catch (error) {
      setTaskId(null); // Stop polling on error
      setIsUploading(false);

      Alert.error(error);
    }
  };

  const handlePdfUpload = async ({ target }) => {
    const { files } = target;
    const file = files[0];

    const formData = new FormData();
    formData.append('file', file);

    const { REACT_APP_API_URL } = getEnv();

    setIsUploading(true);

    try {
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

      if (!result.error) {
        Alert.warning(
          'Task has been submitted. Do not close this page or refresh until finished'
        );

        setTaskId(result.taskId);
      } else {
        Alert.error(result.error);
        setIsUploading(false)
      }
    } catch (error) {
      Alert.error(error);
      setIsUploading(false)
    } 
  };

  React.useEffect(() => {
    if (taskId) {
      const intervalId = setInterval(() => checkTaskStatus(taskId), 10000); // Check every 10 seconds

      return () => clearInterval(intervalId);
    }
  }, [taskId]);

  const deleteFile = async (params: { fileName: string; url?: string }) => {
    const { REACT_APP_API_URL } = getEnv();

    const url = `${REACT_APP_API_URL}/pl:core/delete-file`;

    const { fileName } = params;

    const response = await fetch(url, {
      method: 'post',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      body: `fileName=${fileName}`,
      credentials: 'include',
    });

    const text = await response.text();
    if (!response.ok) {
      throw new Error(text);
    }
    return text;
  };

  const handleDeleteAttachment = async () => {
    if (!attachment) {
      return;
    }
    setIsUploading(true);
    try {
      // Delete all pages concurrently
      await Promise.all(
        attachment.pages.map((page) =>
          deleteFile({
            fileName: page.name,
            url: page.url,
          })
        )
      );

      // Delete the PDF file
      await deleteFile({
        fileName: attachment.pdf.name,
        url: attachment.pdf.url,
      });

      onChange(undefined);
      Alert.success('PDF attachment removed');
    } catch (error) {
      Alert.error(`Deletion failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

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
          accept={'application/pdf'}
        />
      </label>
    </UploadBtn>
  );
};

export default PdfUploader;
