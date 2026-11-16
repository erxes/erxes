import { KeyboardEvent, MouseEvent, useCallback } from 'react';
import { useCopyVariableToken } from './useCopyVariableToken';

const ACTIVATE_KEYS = ['Enter', ' '];

/**
 * A variable card: clicking (or Enter/Space) inserts it when the card is
 * clickable; the copy and link buttons act without triggering the card.
 */
export const useAutomationOutputVariableCard = ({
  token,
  onClick,
  onInsertLink,
}: {
  token: string;
  onClick?: () => void;
  onInsertLink?: () => void;
}) => {
  const { copied, copy } = useCopyVariableToken(token);
  const isClickable = !!onClick;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (onClick && ACTIVATE_KEYS.includes(event.key)) {
        event.preventDefault();
        onClick();
      }
    },
    [onClick],
  );

  const copyToken = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      copy();
    },
    [copy],
  );

  const insertLink = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      onInsertLink?.();
    },
    [onInsertLink],
  );

  return {
    copied,
    isClickable,
    role: isClickable ? 'button' : undefined,
    tabIndex: isClickable ? 0 : undefined,
    handleKeyDown,
    copyToken,
    insertLink,
  };
};
