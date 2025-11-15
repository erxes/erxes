import {
  IconBolt,
  IconCards,
  IconForms,
  IconLetterTSmall,
  IconMusic,
  IconPaperclip,
  IconPhotoScan,
  IconVideo,
} from '@tabler/icons-react';
import { generateAutomationElementId } from 'ui-modules';

export const REPLY_MESSAGE_ACTION_BUTTONS = [
  { type: 'text', title: 'Text', icon: IconLetterTSmall },
  { type: 'card', title: 'Card', icon: IconCards },
  { type: 'quickReplies', title: 'Quick Replies', icon: IconBolt },
  { type: 'input', title: 'Input', icon: IconForms, limit: 1 },
  { type: 'image', title: 'Image', icon: IconPhotoScan, inProgress: true },
  {
    type: 'attachments',
    title: 'Attachments',
    icon: IconPaperclip,
    inProgress: true,
  },
  { type: 'audio', title: 'Audio', icon: IconMusic, inProgress: true },
  { type: 'video', title: 'Video', icon: IconVideo, inProgress: true },
];

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
      type: 'minute' as 'minute' | 'hour' | 'day' | 'month' | 'year',
    },
  },
};
