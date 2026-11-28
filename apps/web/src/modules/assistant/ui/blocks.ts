const BLOCK = /<a2ui>[\s\S]*?(?:<\/a2ui>|$)/g;

const PARTIAL_TAG = /<(a(2(u(i)?)?)?)?$/;

export const hasUi = (text: string) => text.includes('<a2ui>');

export const withoutUi = (text: string, placeholder = '') =>
  text
    .replace(BLOCK, placeholder)
    .replace(/\n{3,}/g, '\n\n')
    .trim();

export const withoutPartialTag = (text: string, streaming: boolean) =>
  streaming ? text.replace(PARTIAL_TAG, '') : text;
