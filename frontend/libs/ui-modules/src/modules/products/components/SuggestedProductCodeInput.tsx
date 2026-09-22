import { IconCheck } from '@tabler/icons-react';
import { Button, Input, InputProps, Tooltip } from 'erxes-ui';

type SuggestedProductCodeInputProps = InputProps & {
  suggestedCode?: string;
  onUseSuggestion: () => void;
};

export const SuggestedProductCodeInput = ({
  suggestedCode,
  onUseSuggestion,
  disabled,
  ...props
}: SuggestedProductCodeInputProps) => {
  const canUseSuggestion = Boolean(suggestedCode) && !props.value && !disabled;

  return (
    <div className="flex w-full">
      <Input
        {...props}
        disabled={disabled}
        placeholder={suggestedCode}
        className={canUseSuggestion ? 'rounded-r-none' : undefined}
      />
      {canUseSuggestion && (
        <Tooltip.Provider>
          <Tooltip>
            <Tooltip.Trigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="-ml-px size-8 shrink-0 rounded-l-none p-0"
                aria-label="Use suggested code"
                onClick={onUseSuggestion}
              >
                <IconCheck className="size-4" />
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content>Use suggested code</Tooltip.Content>
          </Tooltip>
        </Tooltip.Provider>
      )}
    </div>
  );
};
