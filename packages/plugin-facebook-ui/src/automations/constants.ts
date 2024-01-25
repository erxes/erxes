export const BOTTOM_BAR_ITEMS = [
  { type: 'text', title: 'Text', icon: 'file' },
  { type: 'image', title: 'Image', icon: 'mountains' },
  { type: 'card', title: 'Card', icon: 'list-ul' },
  { type: 'quickReplies', title: 'Quick Replies', icon: 'plus-1' },
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
};
