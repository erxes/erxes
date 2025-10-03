export type IAttachment = {
  url: string;
  name: string;
  size: number;
  type: string;
  duration?: number;
};

export type AttachmentContextType = {
  attachments: IAttachment[];
  addAttachment: (attachment: IAttachment) => void;
  handleRemoveImage: (e: React.MouseEvent, attachment: IAttachment) => void;
  resetAttachments: () => void;
  removingUrl: string | null;
};
