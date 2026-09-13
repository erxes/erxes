import { escape } from 'validator';

export const formatViberText = (text: string): string => {
  if (!text.trim()) {
    throw new Error('Invalid Viber text message');
  }

  const escapedText = escape(text);
  const content = escapedText.replace(/\r\n|\r|\n/g, '<br>');

  return `<p>${content}</p>`;
};
