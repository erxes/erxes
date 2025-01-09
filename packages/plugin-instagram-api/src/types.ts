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
