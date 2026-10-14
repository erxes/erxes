import { useDirectMailComposerContext } from '@/integrations/mail/composer/hooks/useDirectMailComposerFields';
import {
  BlockEditor,
  Form,
  ScrollArea,
  usePreviousHotkeyScope,
} from 'erxes-ui';

export const BodyField = () => {
  const {
    form: { control },
    editor,
    handleBodyChange: onChange,
    sending,
    failedDelivery,
  } = useDirectMailComposerContext();
  const disabled = sending || Boolean(failedDelivery);
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();
  return (
    <ScrollArea.Root className="min-h-0 flex-1">
      <ScrollArea.Viewport className="bg-background px-4 py-3">
        <Form.Field
          name="body"
          control={control}
          render={({ field, fieldState }) => (
            <Form.Item
              role="group"
              aria-label="Email message"
              aria-describedby={
                fieldState.error ? 'direct-mail-body-error' : undefined
              }
              data-mail-editor
              className="min-w-0"
              onMouseDownCapture={(event) => {
                if (
                  event.target instanceof Element &&
                  event.target.closest('.bn-formatting-toolbar button')
                )
                  event.preventDefault();
              }}
            >
              <BlockEditor
                editor={editor}
                disabled={disabled}
                onChange={onChange}
                onFocus={() =>
                  setHotkeyScopeAndMemorizePreviousScope(
                    'frontline-mail-editor',
                  )
                }
                onBlur={() => {
                  field.onBlur();
                  goBackToPreviousHotkeyScope();
                }}
                sideMenu={false}
                slashMenuOnTop={false}
                className="min-h-full w-full [&_.bn-editor]:min-h-52 [&_.bn-editor]:bg-background [&_.bn-editor]:px-0 [&_.bn-editor]:text-sm [&_.bn-editor]:text-foreground"
              />
              <Form.Message
                id="direct-mail-body-error"
                role="alert"
                className="mt-1 text-xs"
              />
            </Form.Item>
          )}
        />
      </ScrollArea.Viewport>
      <ScrollArea.Bar />
    </ScrollArea.Root>
  );
};
