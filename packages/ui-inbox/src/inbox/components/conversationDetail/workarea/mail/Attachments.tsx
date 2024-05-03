import {
  AttachmentItem,
  AttachmentsContainer,
  Download,
  FileInfo,
  FileName,
} from "./style";
import { __, getEnv } from "@erxes/ui/src/utils";

import { IMailAttachment } from "../../../../types";
import Icon from "@erxes/ui/src/components/Icon";
import React from "react";
import Tip from "@erxes/ui/src/components/Tip";

type AttachmentsProps = {
  attachments: IMailAttachment[];
  integrationId: string;
  messageId: string;
};

const units = ["B", "KB", "MB", "GB"];

const Attachments: React.FC<AttachmentsProps> = ({
  attachments,
  integrationId,
  messageId,
}) => {
  const formatSize = (size: number): string => {
    let l = 0;
    let n = size || 0;

    while (n >= 1024 && ++l) {
      n = n / 1024;
    }

    return `${n.toFixed(n >= 10 || l < 1 ? 0 : 1)}  ${units[l]}`;
  };

  const getIcon = (type: string): React.ReactNode => {
    if (type.startsWith("image")) {
      return <Icon icon="image-v" size={14} />;
    }

    return <Icon icon="file-alt" size={14} />;
  };

  const createLink = (
    attachmentId: string,
    filename: string,
    type?: string
  ): string => {
    const { REACT_APP_API_URL } = getEnv();

    return `${REACT_APP_API_URL}/pl:imap/read-mail-attachment?messageId=${messageId}&attachmentId=${attachmentId}&integrationId=${integrationId}&filename=${filename}&contentType=${type}`;
  };

  const renderAttach = (
    attachment: IMailAttachment,
    key: number
  ): React.ReactNode => {
    const {
      id,
      size,
      attachmentId,
      content_type,
      mimeType = "",
      filename = "",
    } = attachment;
    const type = mimeType ? mimeType : content_type;

    return (
      <AttachmentItem key={key}>
        {getIcon(type || "")}
        <FileName>{filename}</FileName>

        <FileInfo>
          <span>{formatSize(size)}</span>
          <Tip text={__("Download")} placement="top">
            <Download
              href={createLink(id || attachmentId, filename, type)}
              target="_blank"
            >
              <Icon icon="arrow-down" />
            </Download>
          </Tip>
        </FileInfo>
      </AttachmentItem>
    );
  };

  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <AttachmentsContainer>
      {attachments.map((attach, index) => renderAttach(attach, index))}
    </AttachmentsContainer>
  );
};

export default Attachments;
