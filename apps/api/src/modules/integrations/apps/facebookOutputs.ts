import type { DataField } from '@erxes/core-contract';

const PAGE: DataField[] = [{ key: 'pageId', label: 'Page id', type: 'text', recordType: 'page' }];

export const POST_ID: DataField = {
  key: 'postId',
  label: 'Post id',
  type: 'text',
  recordType: 'post',
};

export const COMMENT_ID: DataField = {
  key: 'commentId',
  label: 'Comment id',
  type: 'text',
  recordType: 'comment',
};

const POST: DataField[] = [
  ...PAGE,
  POST_ID,
  { key: 'message', label: 'Text', type: 'text' },
  { key: 'createdTime', label: 'Posted at', type: 'date' },
];

const SENDER: DataField[] = [
  ...PAGE,
  { key: 'pageName', label: 'Page name', type: 'text' },
  { key: 'senderId', label: 'Sender id', type: 'text', recordType: 'person' },
  { key: 'senderName', label: 'Sender name', type: 'text' },
  { key: 'senderFirstName', label: 'Sender first name', type: 'text' },
  { key: 'senderLastName', label: 'Sender last name', type: 'text' },
  { key: 'senderPicture', label: 'Sender profile picture', type: 'text' },
];

const REFERRAL: DataField[] = [
  { key: 'referralRef', label: 'Link ref', type: 'text' },
  { key: 'referralSource', label: 'Came from (SHORTLINK, ADS, MESSENGER_CODE…)', type: 'text' },
  { key: 'adId', label: 'Ad id', type: 'text' },
  { key: 'adTitle', label: 'Ad title', type: 'text' },
  { key: 'adPostId', label: 'Ad post id', type: 'text' },
];

const SENT_AT: DataField = { key: 'sentAt', label: 'Sent at', type: 'date' };

export const LEAD_OUTPUTS: DataField[] = [
  ...PAGE,
  { key: 'pageName', label: 'Page name', type: 'text' },
  { key: 'email', label: 'Email', type: 'text' },
  { key: 'phone_number', label: 'Phone', type: 'text' },
  { key: 'full_name', label: 'Full name', type: 'text' },
  { key: 'first_name', label: 'First name', type: 'text' },
  { key: 'last_name', label: 'Last name', type: 'text' },
  { key: 'leadId', label: 'Lead id', type: 'text' },
  { key: 'formId', label: 'Form id', type: 'text' },
  { key: 'adId', label: 'Ad id', type: 'text' },
  { key: 'adsetId', label: 'Ad set id', type: 'text' },
  { key: 'campaignId', label: 'Campaign id', type: 'text' },
  { key: 'platform', label: 'Platform (fb, ig)', type: 'text' },
  { key: 'organic', label: 'Organic, not from an ad', type: 'boolean' },
  { key: 'createdTime', label: 'Sent at', type: 'date' },
];

export const MENTION_OUTPUTS: DataField[] = [
  ...PAGE,
  { key: 'item', label: 'In a post or comment', type: 'text' },
  POST_ID,
  COMMENT_ID,
  { key: 'senderId', label: 'Person id', type: 'text' },
  { key: 'senderName', label: 'Person', type: 'text' },
  { key: 'message', label: 'Text', type: 'text' },
];

export const POST_OUTPUTS: DataField[] = [
  ...POST,
  { key: 'item', label: 'Kind (status, photo, video, share)', type: 'text' },
  { key: 'link', label: 'Link', type: 'text' },
  { key: 'photo', label: 'Photo', type: 'text' },
  { key: 'photos', label: 'Photos', type: 'list' },
  { key: 'photoId', label: 'Photo id', type: 'text' },
  { key: 'video', label: 'Video', type: 'text' },
  { key: 'videoId', label: 'Video id', type: 'text' },
  { key: 'published', label: 'Published', type: 'boolean' },
];

export const COMMENT_OUTPUTS: DataField[] = [
  ...POST,
  COMMENT_ID,
  { key: 'parentId', label: 'Replying to (post or comment id)', type: 'text' },
  { key: 'fromId', label: 'Person id', type: 'text' },
  { key: 'fromName', label: 'Person', type: 'text' },
  { key: 'photo', label: 'Photo in the comment', type: 'text' },
  { key: 'postLink', label: 'Post link', type: 'text' },
  { key: 'postType', label: 'Post type', type: 'text' },
];

export const REVIEW_OUTPUTS: DataField[] = [
  ...PAGE,
  { key: 'item', label: 'Review or a reply to one', type: 'text' },
  { key: 'reviewerId', label: 'Person id', type: 'text' },
  { key: 'reviewerName', label: 'Person', type: 'text' },
  { key: 'recommendation', label: 'Recommends (positive or negative)', type: 'text' },
  { key: 'rating', label: 'Stars', type: 'number' },
  { key: 'reviewText', label: 'Review', type: 'text' },
  { key: 'storyId', label: 'Review id', type: 'text' },
  { key: 'createdTime', label: 'Left at', type: 'date' },
];

export const MESSAGE_OUTPUTS: DataField[] = [
  ...SENDER,
  { key: 'messageId', label: 'Message id', type: 'text' },
  { key: 'text', label: 'Text', type: 'text' },
  { key: 'quickReplyPayload', label: 'Quick reply payload', type: 'text' },
  { key: 'replyToMessageId', label: 'Reply to message id', type: 'text' },
  { key: 'command', label: 'Command', type: 'text' },
  { key: 'attachmentCount', label: 'Attachments', type: 'number' },
  { key: 'attachmentType', label: 'Attachment type', type: 'text' },
  { key: 'attachmentUrl', label: 'Attachment link', type: 'text' },
  { key: 'stickerId', label: 'Sticker id', type: 'text' },
  { key: 'latitude', label: 'Latitude', type: 'number' },
  { key: 'longitude', label: 'Longitude', type: 'number' },
  { key: 'productId', label: 'Product id', type: 'text' },
  ...REFERRAL,
  SENT_AT,
];

export const POSTBACK_OUTPUTS: DataField[] = [
  ...SENDER,
  { key: 'postbackTitle', label: 'Button text', type: 'text' },
  { key: 'postbackPayload', label: 'Button payload', type: 'text' },
  { key: 'messageId', label: 'Message id', type: 'text' },
  ...REFERRAL,
  SENT_AT,
];

export const REFERRAL_OUTPUTS: DataField[] = [...SENDER, ...REFERRAL, SENT_AT];
