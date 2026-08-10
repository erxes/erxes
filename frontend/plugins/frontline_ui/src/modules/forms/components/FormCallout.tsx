import { IconX } from '@tabler/icons-react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
  Form,
  Input,
  readImage,
  Switch,
  Textarea,
  useErxesUpload,
} from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { FORM_CALLOUT_SCHEMA } from '../constants/formSchema';
import { FORM_STATES_DEFAULT_VALUES } from '../constants/formStatesDefaultValues';
import { formSetupCalloutAtom } from '../states/formSetupStates';
import { FormMutateLayout } from './FormMutateLayout';
import { FormValueEffectComponent } from './FormValueEffectComponent';

export const FormCallout = () => {
  const { t } = useTranslation('frontline');
  const form = useForm<z.infer<typeof FORM_CALLOUT_SCHEMA>>({
    resolver: zodResolver(FORM_CALLOUT_SCHEMA),
    defaultValues: FORM_STATES_DEFAULT_VALUES.CALLOUT,
  });

  const onSubmit = (_values: z.infer<typeof FORM_CALLOUT_SCHEMA>) => null;

  return (
    <FormMutateLayout
      title={t('callout-label')}
      description={t('callout-settings')}
      form={form}
      onSubmit={onSubmit}
    >
      <FormValueEffectComponent form={form} atom={formSetupCalloutAtom} />
      <div className="px-5 space-y-5">
        <Form.Field
          name="skip"
          render={({ field }) => (
            <Form.Item className="flex items-center gap-2 space-y-0">
              <Form.Control>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </Form.Control>
              <Form.Label variant="peer">{t('callout-skip')}</Form.Label>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          name="title"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('title-label')}</Form.Label>
              <Form.Control>
                <Input {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          name="body"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('callout-body')}</Form.Label>
              <Form.Control>
                <Textarea {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          name="buttonText"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('button-text')}</Form.Label>
              <Form.Control>
                <Input {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          name="featuredImage"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('image-label')}</Form.Label>
              <Form.Control>
                <FormCalloutImage
                  value={field.value}
                  onValueChange={field.onChange}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>
    </FormMutateLayout>
  );
};

export const FormCalloutImage = ({
  value,
  onValueChange,
}: {
  value: string | null;
  onValueChange: (value: string | null) => void;
}) => {
  const props = useErxesUpload({
    allowedMimeTypes: ['image/*'],
    maxFiles: 1,
    maxFileSize: 20 * 1024 * 1024,
    onFilesAdded: (addedFiles) => {
      onValueChange(addedFiles[0]?.url ?? null);
    },
  });

  useEffect(() => {
    const hasValidFiles =
      props.files.length > 0 && props.files.every((f) => f.errors.length === 0);
    if (hasValidFiles && !props.loading) {
      props.onUpload();
    }
  }, [props.files]);

  return value ? (
    <div className="relative p-2 border border-dashed rounded-md aspect-video">
      <img
        src={readImage(value)}
        alt="callout"
        className="w-full h-auto object-cover"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2"
        onClick={() => onValueChange(null)}
      >
        <IconX size={12} />
      </Button>
    </div>
  ) : (
    <Dropzone {...props}>
      <DropzoneEmptyState />
      <DropzoneContent />
    </Dropzone>
  );
};
