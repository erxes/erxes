import { type ClipboardEvent } from 'react';

export const handleStringArrayPaste = ({
  event,
  value,
  onValueChange,
}: {
  event: ClipboardEvent<HTMLInputElement>;
  value: string[];
  onValueChange: (value: string[]) => void;
}) => {
  const pastedValues = event.clipboardData
    .getData('text')
    .split(/\r\n|\r|\n/)
    .map((value) => value.trim())
    .filter(Boolean);

  if (pastedValues.length <= 1) {
    return;
  }

  event.preventDefault();
  onValueChange(Array.from(new Set([...value, ...pastedValues])));
};
