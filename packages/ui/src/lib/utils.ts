import { createCn } from 'cn/config';
import type { Ref, RefCallback } from 'react';

/**
 * Joins classes and drops the ones a later class overrides. The theme scales below are the
 * tokens theme.css and styles.css add, so `cn('shadow-sm', 'shadow-focus')` keeps only the last.
 * A new token in those files gets its name added here.
 */
export const cn = createCn({
  extend: {
    theme: {
      shadow: [
        'focus',
        'subtle',
        'destructive',
        'focus-destructive',
        'button-primary',
        'button-outline',
      ],
      spacing: ['cell'],
      text: ['3xs', '2xs'],
      animate: [
        'accordion-down',
        'accordion-up',
        'spinner',
        'bot-appear',
        'bot-rock',
        'bot-glance',
        'bot-blink',
        'bot-dots',
        'text-shimmer',
        'first',
        'second',
        'third',
        'fourth',
        'fifth',
      ],
    },
    classGroups: { scrollbar: ['hide-scroll', 'styled-scroll'] },
  },
});

/** One ref callback that sets every given ref, for an element both the component and its caller need. */
export const mergeRefs =
  <T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> =>
  (node) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    }
  };
