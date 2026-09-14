import { zodResolver } from '@hookform/resolvers/zod';
import { IconInfoCircle, IconPlus, IconTrash } from '@tabler/icons-react';
import {
  Button,
  Form,
  Label,
  Separator,
  Switch,
  Textarea,
  toast,
} from 'erxes-ui';
import { useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { AutomationActionFormProps } from 'ui-modules';
import { FileUploadSection } from '~/widgets/automations/modules/facebook/components/action/components/FileUploadSection';
import { InputTextCounter } from '~/widgets/automations/modules/facebook/components/action/components/InputTextCounter';
import {
  commentActionFormSchema,
  TCommentActionForm,
  toCommentActionFormValues,
} from '~/widgets/automations/modules/facebook/components/action/states/replyCommentActionForm';

const TEXT_LIMIT = 8000;

/** A heading for a group of fields, which is not a label for any one control. */
const SectionHeading = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div className="flex flex-col gap-1">
    <Label className="text-sm font-semibold">{title}</Label>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

export const CommentActionForm = ({
  formRef,
  currentAction,
  onSaveActionConfig,
}: AutomationActionFormProps) => {
  const { t } = useTranslation('frontline');
  const form = useForm<TCommentActionForm>({
    resolver: zodResolver(commentActionFormSchema),
    defaultValues: toCommentActionFormValues(currentAction?.config),
  });
  const { control } = form;

  const texts = form.watch('texts') || [];

  const setTexts = (next: string[]) =>
    form.setValue('texts', next, {
      shouldDirty: true,
      shouldValidate: form.formState.isSubmitted,
    });

  useImperativeHandle(formRef, () => ({
    submit: form.handleSubmit(onSaveActionConfig, () =>
      toast({
        title: t('form-error', 'There is some error in the form'),
        variant: 'destructive',
      }),
    ),
  }));

  return (
    <div className="w-[600px] max-w-full p-4">
      <Form {...form}>
        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-3">
            <SectionHeading
              title={t('reply-variants', { defaultValue: 'Reply variants' })}
              description={t('reply-variants-description', {
                defaultValue:
                  'One is picked at random for each comment, so the same sentence does not fill a post.',
              })}
            />

            {texts.map((_, index) => (
              <Form.Field
                // Identity here is the position: the list is rendered from form
                // state, so a removal re-reads every value from the source.
                key={index}
                control={control}
                name={`texts.${index}`}
                render={({ field }) => (
                  <Form.Item className="flex flex-col gap-1.5 space-y-0">
                    <div className="flex items-center justify-between gap-2">
                      <Label className="text-xs text-muted-foreground">
                        {t('variant-n', {
                          defaultValue: 'Variant {{index}}',
                          index: index + 1,
                        })}
                      </Label>
                      <div className="flex items-center gap-1">
                        <InputTextCounter
                          count={field.value?.length || 0}
                          limit={TEXT_LIMIT}
                        />
                        {texts.length > 1 && (
                          <Button
                            size="icon"
                            variant="ghost"
                            type="button"
                            aria-label={t('remove', { defaultValue: 'Remove' })}
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() =>
                              setTexts(texts.filter((_, i) => i !== index))
                            }
                          >
                            <IconTrash />
                          </Button>
                        )}
                      </div>
                    </div>
                    <Form.Control>
                      <Textarea
                        {...field}
                        rows={3}
                        placeholder={t('enter-your-text')}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            ))}

            <Button
              variant="secondary"
              type="button"
              className="w-full"
              onClick={() => setTexts([...texts, ''])}
            >
              <IconPlus />
              {t('add-reply-variant', { defaultValue: 'Add reply variant' })}
            </Button>

            {texts.length === 1 && (
              <p className="flex items-start gap-1.5 text-xs text-warning">
                <IconInfoCircle className="mt-0.5 size-3.5 shrink-0" />
                {t('single-reply-variant-warning', {
                  defaultValue:
                    'With one variant every reply under a post is identical, which Meta treats as repetitive content. Add at least two more.',
                })}
              </p>
            )}
          </section>

          <Separator />

          <Form.Field
            control={control}
            name="mentionSender"
            render={({ field }) => (
              <Form.Item className="flex flex-row items-start justify-between gap-6 space-y-0">
                <div className="flex flex-col gap-1">
                  <Form.Label className="text-sm font-semibold">
                    {t('mention-commenter', {
                      defaultValue: 'Mention the commenter',
                    })}
                  </Form.Label>
                  <Form.Description>
                    {t('mention-commenter-description', {
                      defaultValue:
                        'Tags the person by name at the start of the public reply.',
                    })}
                  </Form.Description>
                </div>
                <Form.Control>
                  <Switch
                    className="mt-1 shrink-0"
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                  />
                </Form.Control>
              </Form.Item>
            )}
          />

          <Separator />

          <Form.Field
            control={control}
            name="attachments"
            render={({ field }) => (
              <Form.Item className="flex flex-col gap-3 space-y-0">
                <SectionHeading
                  title={t('attachments-label')}
                  description={t('attachments-description', {
                    defaultValue:
                      'One image, posted with every reply. Facebook fetches it, so it stays public.',
                  })}
                />
                <Form.Control>
                  <FileUploadSection
                    url={field.value?.[0]?.url}
                    onUpload={(fileUrl) =>
                      // Facebook accepts a single `attachment_url` here, so the
                      // list never holds more than the one just uploaded.
                      field.onChange(
                        fileUrl ? [{ url: fileUrl, type: 'image' }] : [],
                      )
                    }
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
        </div>
      </Form>
    </div>
  );
};
