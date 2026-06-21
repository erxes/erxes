import {
  IconBolt,
  IconCards,
  IconForms,
  IconMessage,
  IconMusic,
  IconPaperclip,
  IconPhotoScan,
  IconTicket,
  IconVideo,
} from '@tabler/icons-react';
import { generateAutomationElementId } from 'ui-modules';

const DEFAULT_INPUT_TIME_UNIT = 'minute' as const;

export const INITIAL_OBJ_MESSAGE_TYPES = {
  text: {
    text: '',
    buttons: [],
  },
  image: {
    image: '',
  },
  card: {
    cards: [
      {
        _id: generateAutomationElementId(),
        label: `Page 1`,
        title: '',
        subtitle: '',
        buttons: [],
      },
    ],
  },
  quickReplies: {
    quickReplies: [],
  },
  attachments: {
    attachments: [],
  },
  audio: {
    audio: '',
  },
  video: {
    video: '',
  },
  input: {
    input: {
      text: '',
      value: '1',
      type: DEFAULT_INPUT_TIME_UNIT,
    },
  },
  ticketForm: {
    text: 'Please fill in the ticket details:',
  },
};

type TReplyMessageActionType = keyof typeof INITIAL_OBJ_MESSAGE_TYPES;
type TReplyMessageActionIcon = typeof IconMessage;

type TReplyMessageActionButton = {
  type: TReplyMessageActionType;
  title: string;
  icon: TReplyMessageActionIcon;
  limit?: number;
};

export const REPLY_MESSAGE_ACTION_BUTTONS: TReplyMessageActionButton[] = [
  { type: 'text', title: 'Text', icon: IconMessage },
  { type: 'card', title: 'Card', icon: IconCards },
  { type: 'quickReplies', title: 'Quick Replies', icon: IconBolt },
  { type: 'input', title: 'Input', icon: IconForms, limit: 1 },
  { type: 'image', title: 'Image', icon: IconPhotoScan },
  {
    type: 'attachments',
    title: 'Attachments',
    icon: IconPaperclip,
  },
  { type: 'audio', title: 'Audio', icon: IconMusic },
  { type: 'video', title: 'Video', icon: IconVideo },
];
