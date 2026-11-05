import type { KeyboardEvent } from 'react';

export const preventImplicitSubmit = (
  event: KeyboardEvent<HTMLInputElement>,
): void => {
  if (
    event.key === 'Enter' &&
    !event.defaultPrevented &&
    !event.nativeEvent.isComposing &&
    event.target instanceof HTMLInputElement
  ) {
    event.preventDefault();
  }
};
