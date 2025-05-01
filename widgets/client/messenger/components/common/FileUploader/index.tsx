import * as React from "react";

import { IconUpload } from "../../../../icons/Icons";
import { useDropzone } from "react-dropzone";

const img = {
  display: "block",
  width: "100px",
  height: "100%",
};

const FileUploader = ({
  handleFiles,
}: {
  handleFiles?: (files: any) => void;
}) => {
  const [files, setFiles] = React.useState<
    {
      name: string | null | undefined;
      preview: string;
    }[]
  >([]);
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [],
    },
    onDrop: (acceptedFiles) => {
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        )
      );
    },
  });

  const thumbs = files.map((file) => (
    <div className="dropzone-thumb" key={file.name}>
      <div className="inner">
        <img
          src={file.preview}
          style={img}
          // Revoke data uri after image is loaded
          onLoad={() => {
            URL.revokeObjectURL(file.preview);
          }}
        />
      </div>
    </div>
  ));

  React.useEffect(() => {
    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
  }, []);

  React.useEffect(() => {
    return handleFiles && handleFiles(files);
  }, [files]);

  return (
    <section className="dropzone-container">
      <div {...getRootProps({ className: "dropzone" })}>
        <input {...getInputProps()} />
        <div className="dropzone-field-description">
          <IconUpload />
          <p>Upload screenshot or your a file here</p>
        </div>
      </div>
      <aside className="dropzone-thumbs-container">{thumbs}</aside>
    </section>
  );
};

export default FileUploader;
