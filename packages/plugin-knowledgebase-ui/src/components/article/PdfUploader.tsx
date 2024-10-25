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
  const { attachment, onChange } = props;

  const handlePdfUpload = async ({ target }) => {
    const { files } = target;
    const file = files[0];

    const formData = new FormData();
    formData.append('file', file);

    const { REACT_APP_API_URL } = getEnv();

    setIsUploading(true);
    Alert.info(
      'Uploading PDF, do not close this page or refresh until finished'
    );

    try {
      const res = await fetch(
        `${REACT_APP_API_URL}/pl:knowledgebase/upload-pdf`,
        {
          method: 'POST',
          body: formData,
          credentials: 'include',
          headers: {
            Accept: 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );

      const result = await res.json();

      if (!result.error) {
        Alert.success('Successfully uploaded');
        const pdfAttachment: IPdfAttachment = {
          pdf: {
            name: file.name,
            type: 'application/pdf',
            url: result.pdf,
          },
          pages: result.pages.map((page, index) => ({
            name: `page-${index + 1}.jpg`,
            url: page,
            type: 'image/jpeg',
          })),
        };

        onChange(pdfAttachment);
      } else {
        Alert.error(result.error);
      }
    } catch (error) {
      Alert.error(error.message);
    } finally {
      setIsUploading(false);
    }
  };

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
