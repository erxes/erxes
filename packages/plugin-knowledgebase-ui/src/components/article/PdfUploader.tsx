import React from 'react';
import { UploadBtn, AttachmentContainer, PageImage, DeleteButton } from './styles';
import { __, getEnv } from '@erxes/ui/src/utils';
import Alert from '@erxes/ui/src/utils/Alert';
import Spinner from '@erxes/ui/src/components/Spinner';
import { IPdfAttachment } from '@erxes/ui-knowledgeBase/src/types';

type Props = {
  attachment?: IPdfAttachment;
  onChange: (attachment: IPdfAttachment | undefined) => void;
};

const PdfUploader = (props: Props) => {
  const [isUploading, setIsUploading] = React.useState(false);
  const { attachment, onChange } = props;

  const handlePdfUpload = async ({ target }) => {
    const files = target.files;
    const file = files[0];
    const formData = new FormData();
    formData.append('file', file);

    const { REACT_APP_API_URL } = getEnv();

    setIsUploading(true);
    Alert.info('Uploading PDF, do not close this page or refresh until finished');

    try {
      const res = await fetch(`${REACT_APP_API_URL}/pl:knowledgebase/upload-pdf`, {
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
        Alert.success('Successfully uploaded');
        onChange(result); // Pass the result to the parent component
      } else {
        Alert.error(result.error);
      }
    } catch (error) {
      Alert.error(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAttachment = () => {
    onChange(undefined); // Clear the attachment
    Alert.success('PDF attachment removed');
  };

  const handleDeletePage = (pageUrl: string) => {
    if (!attachment) {
      return;
    }
    const updatedPages = attachment.pages.filter(page => page.url !== pageUrl);
    onChange({ pdf: attachment.pdf, pages: updatedPages });
    Alert.success('Page removed');
  };

  if (attachment) {
    return (
      <AttachmentContainer>
        <h4>Uploaded PDF: {attachment.pdf.name}</h4>
        <a href={attachment.pdf.url} target="_blank" rel="noopener noreferrer">View PDF</a>
        <DeleteButton onClick={handleDeleteAttachment}>Delete PDF</DeleteButton>

        <h4>Pages:</h4>
        {attachment.pages.map((page) => (
          <div key={page.url}>
            <PageImage src={page.url} alt={`Page image`} />
            <DeleteButton onClick={() => handleDeletePage(page.url)}>Delete Page</DeleteButton>
          </div>
        ))}
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
