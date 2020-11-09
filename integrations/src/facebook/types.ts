export interface IPostParams {
  id?: string;
  created_time?: number;
  post_id?: string;
  video_id?: string;
  link?: string;
  photo_id?: string;
  item?: string;
  photos?: string[];

  caption?: string;
  description?: string;
  picture?: string;
  source?: string;
  message?: string;
  from?: any;
  permalink_url?: string;
}

export interface ICommentParams {
  post_id: string;
  created_time?: number;
  parent_id?: string;
  item?: string;
  comment_id?: string;
  video?: string;
  photo?: string;
  from?: any;
  message?: string;
  restoredCommentCreatedAt?: string;
  verb?: string;
  post?: any;
}

export interface IChannelData {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  text?: string;
  attachments?: Array<{
    type: string;
    payload: { url: string };
  }>;
  message: {
    mid: string;
  };
}

export interface IAttachment {
  type: string;
  url: string;
}

export interface IAttachmentMessage {
  attachment: {
    type: string;
    payload: {
      url: string;
    };
  };
}
