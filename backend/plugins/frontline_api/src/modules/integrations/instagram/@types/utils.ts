export interface IKind {
  kind: string;
}

export interface IDetailParams {
  erxesApiId: string;
}

export interface IConversationId {
  conversationId: string;
}

export interface IPageParams {
  skip?: number;
  limit?: number;
}

export interface ICommentsParams extends IConversationId, IPageParams {
  isResolved?: boolean;
  commentId?: string;
  senderId: string;
}

export interface IMessagesParams extends IConversationId, IPageParams {
  getFirst?: boolean;
}

export interface ICommentStatusParams {
  commentId: string;
}

export interface IReplyParams extends ICommentStatusParams {
  conversationId: string;
  content: string;
  attachments: any;
}
// instagram-2.0 couldnt find copy from facebook 3.0 IPostParams, ICommentParams, IMessagePostback,IChannelData, Activity

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
  verb: string;
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

export interface IMessageData {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  text?: string;
  message: {
    attachments?: Array<{
      type: string;
      payload?: any;
    }>;
    quick_reply?: any; // Consider defining a type here if you know its structure
    referral?: {
      source: string;
      type: string;
      ad_id: string;
      ads_context_data: {
        ad_title: string;
        post_id: string;
        photo_url: string;
      };
    };
    payload?: any; // Same as above
    mid: string;
    text: string;
    is_deleted: boolean;
  };
  postback: {
    title: string;
    mid: string;
    payload: string;
    quick_reply?: any; // Same as above, consider typing it more specifically
  };
  comments: {
    title: string;
    mid: string;
    payload: string;
    quick_reply?: any;
  };
}

interface IMessagePostback {
  title?: string;
  mid: string;
  payload: string;
  referral?: {
    source: string;
    type: string;
    ad_id?: string;
    ads_context_data?: {
      ad_title?: string;
      post_id?: string;
      photo_url?: string;
    };
  };
}

export interface IChannelData {
  sender: {
    id: string;
  };
  recipient: {
    id: string;
  };
  timestamp: number;

  message?: {
    mid: string;
    text?: string;
    attachments?: Array<{
      type: string;
      payload: {
        url: string;
      };
    }>;
    quick_reply?: {
      payload: string;
    };
    referral?: {
      source: string;
      type: string;
      ad_id?: string;
      ads_context_data?: {
        ad_title?: string;
        post_id?: string;
        photo_url?: string;
      };
    };
    payload?: any;
  };
  postback?: IMessagePostback;
}

export interface Activity {
  channelId: string;
  timestamp: Date;
  conversation: { id: string };
  from: { id: string; name: string };
  recipient: { id: string; name: string };
  channelData: IChannelData;
  type: string;
  text: string;
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
