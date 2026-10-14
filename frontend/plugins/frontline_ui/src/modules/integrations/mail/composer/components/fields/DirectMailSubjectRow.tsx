import { useDirectMailComposerContext } from '@/integrations/mail/composer/hooks/useDirectMailComposerFields';
import { Form, Input, Label } from 'erxes-ui';

export const SubjectRow = () => {
  const {
    form: { control },
  } = useDirectMailComposerContext();
  return (
    <Form.Field
      control={control}
      name="subject"
      render={({ field, fieldState }) => (
        <Form.Item className="grid flex-none space-y-0 gap-y-1 grid-cols-[3.5rem_minmax(0,1fr)] items-center border-b px-4 py-1.5">
          <Label
            variant="peer"
            className="text-xs leading-5 text-muted-foreground"
            htmlFor="direct-mail-subject"
          >
            Subject
          </Label>
          <Input
            {...field}
            id="direct-mail-subject"
            aria-invalid={fieldState.invalid}
            aria-describedby={
              fieldState.error ? 'direct-mail-subject-error' : undefined
            }
            className="h-9 border-0 bg-transparent px-0 shadow-none hover:bg-transparent focus:bg-transparent focus-visible:shadow-none"
          />
          <Form.Message
            id="direct-mail-subject-error"
            role="alert"
            className="col-start-2 text-xs"
          />
        </Form.Item>
      )}
    />
  );
};
