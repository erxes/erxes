import * as React from 'react';

export const useComposedRef = <T extends HTMLElement>(
  forwardedRef: React.ForwardedRef<T>,
) => {
  const innerRef = React.useRef<T | null>(null);
  const setRef = React.useCallback(
    (node: T | null) => {
      innerRef.current = node;

      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    },
    [forwardedRef],
  );

  return [innerRef, setRef] as const;
};
