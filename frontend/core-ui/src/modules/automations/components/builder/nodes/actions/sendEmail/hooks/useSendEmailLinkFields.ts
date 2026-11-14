import { ChangeEvent, KeyboardEvent, useCallback, useState } from 'react';
import { TAutomationVariableDragPayload } from 'ui-modules';

/**
 * A link's text and address inputs: Enter submits, and a picked variable is
 * appended to the address, naming the link too when it has no text yet.
 */
export const useSendEmailLinkFields = ({
  textValue,
  urlValue,
  onTextChange,
  onUrlChange,
  onSubmit,
}: {
  textValue: string;
  urlValue: string;
  onTextChange: (value: string) => void;
  onUrlChange: (value: string) => void;
  onSubmit: () => void;
}) => {
  const [isVariableOpen, setIsVariableOpen] = useState(false);

  const handleInsertVariable = useCallback(
    (payload: TAutomationVariableDragPayload) => {
      onUrlChange(`${urlValue}${payload.token}`);

      if (!textValue.trim()) {
        onTextChange(payload.label);
      }

      setIsVariableOpen(false);
    },
    [urlValue, textValue, onUrlChange, onTextChange],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        onSubmit();
      }
    },
    [onSubmit],
  );

  const handleTextChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) =>
      onTextChange(event.currentTarget.value),
    [onTextChange],
  );

  const handleUrlChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) =>
      onUrlChange(event.currentTarget.value),
    [onUrlChange],
  );

  return {
    isVariableOpen,
    setIsVariableOpen,
    handleInsertVariable,
    handleKeyDown,
    handleTextChange,
    handleUrlChange,
  };
};
