import { useState } from 'react';

import { REACT_APP_API_URL } from 'erxes-ui/utils';
import { useToast } from 'erxes-ui/hooks';

type FileInfo = {
  name: string;
  size: number;
  type: string;
  duration: number;
};

type AfterUploadParams = {
  status: 'ok' | 'error';
  response: any;
  fileInfo: FileInfo;
};

type AfterReadParams = {
  result: any;
  fileInfo: FileInfo;
};

type UploadProps = {
  files: FileList | null;
  beforeUpload?: () => void;
  afterUpload: (params: AfterUploadParams) => void;
  afterRead?: (params: AfterReadParams) => void;
  url?: string;
  kind?: string;
  userId?: string;
  responseType?: string;
  extraFormData?: Array<{ key: string; value: string }>;
  maxHeight?: number;
  maxWidth?: number;
};

type RemoveProps = {
  fileName: string;
  url?: string;
  afterRemove: ({ status }: { status: string }) => any;
};

export const useUpload = () => {
  const [status, setStatus] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const upload = ({
    files,
    beforeUpload,
    afterUpload,
    afterRead,
    url = `${REACT_APP_API_URL}/upload-file`,
    kind = 'main',
    responseType = 'text',
    userId,
    maxHeight = 0,
    maxWidth = 0,
  }: UploadProps) => {
    if (!files || files.length === 0) {
      return;
    }

    setIsLoading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let type = file.type;
      if (file.name.endsWith('.hwp')) {
        type = 'application/haansoft-hwp';
      }

      if (file.name.endsWith('.hwpx')) {
        type = 'application/haansoft-hwpml';
      }

      // initiate upload file reader
      const uploadReader = new FileReader();

      const fileInfo = {
        name: file.name,
        size: file.size,
        type,
        duration: 0,
      } as any;

      // const fileUploadMaxSize = REACT_APP_FILE_UPLOAD_MAX_SIZE || 20 * 1024 * 1024;
      const fileUploadMaxSize: number =
        Number.parseInt(
          localStorage.getItem('erxes_env_REACT_APP_FILE_UPLOAD_MAX_SIZE') ||
            '',
          10,
        ) || 20 * 1024 * 1024;

      // skip file that size is more than REACT_APP_FILE_UPLOAD_MAX_SIZE
      if (fileInfo.size > fileUploadMaxSize) {
        toast({
          description: `Your file ${
            fileInfo.name
          } size is too large. Upload files less than ${
            fileUploadMaxSize / 1024 / 1024
          }MB of size.`,
        });

        continue;
      }

      // after read process done
      uploadReader.onloadend = () => {
        // before upload
        if (beforeUpload) {
          beforeUpload();
        }

        const formData = new FormData();
        formData.append('file', file);

        fetch(
          `${url}?kind=${kind}&maxHeight=${maxHeight}&maxWidth=${maxWidth}`,
          {
            method: 'post',
            body: formData,
            credentials: 'include',
            ...(userId ? { headers: { userId } } : {}),
          },
        )
          .then((response: any) => {
            response[responseType]()
              .then((text: unknown) => {
                setIsLoading(false);

                if (!response.ok) {
                  setStatus(false);

                  return toast({
                    title: 'Error uploading file',
                    description:
                      'Failed to upload file please check your file upload config',
                    variant: 'destructive',
                  });
                }

                setStatus(true);

                // after upload
                if (afterUpload) {
                  afterUpload({ status: 'ok', response: text, fileInfo });
                }
              })
              .catch((error: Error) => {
                setIsLoading(false);
                setStatus(false);
                toast({ description: error.message });
              });
          })
          .catch((error) => {
            setIsLoading(false);
            setStatus(false);
            toast({ description: error.message });
          });
      };

      // begin read
      uploadReader.readAsArrayBuffer(file);

      // read as data url for preview purposes
      const reader = new FileReader();

      reader.onloadend = () => {
        if (afterRead) {
          afterRead({ result: reader.result, fileInfo });
        }
      };

      reader.readAsDataURL(file);
    }
  };

  const remove = ({
    fileName,
    url = `${REACT_APP_API_URL}/delete-file`,
    afterRemove,
  }: RemoveProps) => {
    setIsLoading(true);

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
          setIsLoading(false);

          if (!response.ok) {
            setStatus(false);
            return afterRemove({
              status: text,
            });
          }

          setStatus(true);

          return afterRemove({ status: 'ok' });
        })
        .catch((error) => {
          setIsLoading(false);
          setStatus(false);
          toast({ description: error.message });
        });
    });
  };

  return { isLoading, status, upload, remove };
};
