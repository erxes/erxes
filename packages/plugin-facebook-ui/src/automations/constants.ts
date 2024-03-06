export const BOTTOM_BAR_ITEMS = [
  { type: 'text', title: 'Text', icon: 'file' },
  { type: 'card', title: 'Card', icon: 'list-ul' },
  { type: 'quickReplies', title: 'Quick Replies', icon: 'plus-1' },
  { type: 'image', title: 'Image', icon: 'mountains' },
  { type: 'attachments', title: 'Attachments', icon: 'attach' },
  { type: 'audio', title: 'Audio', icon: 'music-1' },
  { type: 'video', title: 'Video', icon: 'play-1' },
  { type: 'input', title: 'Input', icon: 'space-key' },
];

export const INITIAL_OBJ_ACTIONS = {
  text: {
    text: '',
    buttons: [],
  },
  image: {
    image: '',
  },
  card: {
    cards: [],
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
    input: {},
  },
};
