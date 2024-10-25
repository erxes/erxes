import { IPdfAttachment } from '@erxes/ui-knowledgeBase/src/types';
import Attachment from '@erxes/ui/src/components/Attachment';
import Spinner from '@erxes/ui/src/components/Spinner';
import { __, getEnv } from '@erxes/ui/src/utils';
import Alert from '@erxes/ui/src/utils/Alert';
import React from 'react';
import {
  AttachmentContainer,
  UploadBtn
} from './styles';

type Props = {
  attachment?: IPdfAttachment;
  onChange: (attachment: IPdfAttachment | undefined) => void;
};

const PdfUploader = (props: Props) => {

  const [isUploading, setIsUploading] = React.useState(false);
  const { attachment, onChange } = props;

  const handlePdfUpload = async ({ target }) => {
    const {files} = target;
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

  const deleteHandler = (params: {
    fileName: string;
    url?: string;
    afterUpload: ({ status }: { status: string }) => any;
  }) => {
    const { REACT_APP_API_URL } = getEnv();

    const url = `${REACT_APP_API_URL}/pl:core/delete-file`;

    const { fileName, afterUpload } = params;

    fetch(url, {
      method: 'post',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      body: `fileName=${fileName}`,
      credentials: 'include',
    }).then((response) => {
      response
        .text()
        .then((text) => {
          if (!response.ok) {
            return afterUpload({
              status: text,
            });
          }

          return afterUpload({ status: 'ok' });
        })
        .catch((error) => {
          Alert.error(error.message);
        });
    });
  };
  const handleDeleteAttachment = () => {
    if (!attachment) {
      return;
    }
    // delete every page
    attachment.pages.forEach((page) => {
      deleteHandler({
        fileName: page.name,
        url: page.url,
        afterUpload: () => {
          deleteHandler({
            fileName: attachment.pdf.name,
            url: attachment.pdf.url,
            afterUpload: ({ status }) => {
              if (status === 'ok') {
                onChange(undefined); // Clear the attachment
                Alert.success('PDF attachment removed');
              } else {
                Alert.error(status);
              }
            },
          });
        },
      });
    });
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
