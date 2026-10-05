import { z } from 'zod';
import {
  DEFAULT_COMPOSER_HEIGHT,
  MIN_COMPOSER_HEIGHT,
  MIN_EDITOR_HEIGHT,
} from '../constants/composer';

const GALLERY_IMAGES_SCHEMA = z.array(
  z.object({ url: z.string().min(1), caption: z.string().optional() }),
);

export const getGalleryImages = (
  raw: string,
): z.infer<typeof GALLERY_IMAGES_SCHEMA> => {
  try {
    const result = GALLERY_IMAGES_SCHEMA.safeParse(JSON.parse(raw));
    return result.success ? result.data : [];
  } catch {
    return [];
  }
};

export const getDefaultSize = (height: number) =>
  Math.min(75, Math.max(30, (DEFAULT_COMPOSER_HEIGHT / height) * 100));

export const getMinimumComposerHeight = (group: HTMLElement): number => {
  const form = group.querySelector<HTMLElement>('[data-composer-form]');
  const shell = form?.parentElement;
  if (!form || !shell) return MIN_COMPOSER_HEIGHT;

  const formStyle = getComputedStyle(form);
  const shellStyle = getComputedStyle(shell);
  const pixels = (value: string): number => Number.parseFloat(value) || 0;
  const controlsHeight = Array.from(form.children).reduce((height, child) => {
    if (child.hasAttribute('data-composer-scroll')) return height;
    const style = getComputedStyle(child);
    return (
      height +
      child.getBoundingClientRect().height +
      pixels(style.marginTop) +
      pixels(style.marginBottom)
    );
  }, 0);

  return Math.max(
    MIN_COMPOSER_HEIGHT,
    Math.ceil(
      MIN_EDITOR_HEIGHT +
        controlsHeight +
        pixels(shellStyle.paddingTop) +
        pixels(shellStyle.paddingBottom) +
        pixels(formStyle.paddingTop) +
        pixels(formStyle.paddingBottom) +
        pixels(formStyle.borderTopWidth) +
        pixels(formStyle.borderBottomWidth) +
        pixels(formStyle.rowGap) * Math.max(0, form.children.length - 1),
    ),
  );
};
