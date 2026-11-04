import type { KeyboardEvent } from 'react';

/** Stops single-line Enter from activating the form's default button. */
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
