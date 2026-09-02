import { createElement, type ImgHTMLAttributes } from 'react';

export const InboxImage = (props: ImgHTMLAttributes<HTMLImageElement>) =>
  createElement('img', props);
