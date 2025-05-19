import * as React from "react";

import { IconUpload } from "../../../../icons/Icons";
import { readFile } from "../../../../utils";
import uploadHandler from "../../../../uploadHandler";
import { useDropzone } from "react-dropzone";

const imgStyle = {
  display: "block",
  width: "100px",
  height: "80px",
  "object-fit": "cover",
};

interface FileWithUrl extends File {
  url?: string;
}

const FileUploader = ({
  handleFiles,
}: {
  handleFiles: (files: any) => void;
}) => {
  const [files, setFiles] = React.useState<FileWithUrl[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);

  const sendFiles = (files: FileList) => {
    const uploadedFiles: FileWithUrl[] = [];
    const total = files.length;
    let completed = 0;

    uploadHandler({
      files,
      beforeUpload: () => {
        setIsUploading(true);
      },
      // upload to server
      afterUpload({ response, fileInfo }: { response: any; fileInfo: any }) {
        const updatedFile = {
          ...fileInfo,
          url: response,
        } as FileWithUrl;

        uploadedFiles.push(updatedFile);
        setFiles((prev) => [...prev, updatedFile]);

        completed++;

        if (completed === total) {
          setIsUploading(false);
          handleFiles(uploadedFiles); // ✅ send only after all uploads
        }
      },

      onError: (message) => {
        alert(message);
        setIsUploading(false);
      },
    });
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [],
    },
    onDrop: (acceptedFiles) => {
      const updatedFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );

      const dataTransfer = new DataTransfer();
      updatedFiles.forEach((file) => dataTransfer.items.add(file));
      const fileList = dataTransfer.files;

      if (fileList && fileList.length > 0) {
        sendFiles(fileList);
      }
    },
  });

  const thumbs = files.map((file) => (
    <div className="dropzone-thumb" key={file.name}>
      <div className="inner">
        <img
          src={readFile(file.url || "")}
          style={imgStyle}
          // Revoke data uri after image is loaded
          onLoad={() => {
            if (file.url?.startsWith("blob:")) {
              URL.revokeObjectURL(file.url);
            }
          }}
        />
      </div>
    </div>
  ));

  React.useEffect(() => {
    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    return () => files.forEach((file) => URL.revokeObjectURL(file.name));
  }, [files]);

  return (
    <section className="dropzone-container">
      <div {...getRootProps({ className: "dropzone" })}>
        <input {...getInputProps()} />
        <div className="dropzone-field-description">
          {isUploading ? (
            <div className="relative w-[43px] h-[43px]">
              <div className="loader" />
            </div>
          ) : (
            <IconUpload />
          )}
          <p>Upload screenshot or your a file here</p>
        </div>
      </div>
      <aside className="dropzone-thumbs-container">{thumbs}</aside>
    </section>
  );
};

export default FileUploader;
