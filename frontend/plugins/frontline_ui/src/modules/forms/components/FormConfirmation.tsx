import { FormMutateLayout } from './FormMutateLayout';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FORM_CONFIRMATION_SCHEMA } from '../constants/formSchema';
import { FormValueEffectComponent } from './FormValueEffectComponent';
import { formSetupConfirmationAtom } from '../states/formSetupStates';
import {
  Form,
  Input,
  Textarea,
  Dropzone,
  useErxesUpload,
  DropzoneContent,
  useRemoveFile,
  Button,
  IAttachment,
  DropzoneEmptyState,
  readImage,
} from 'erxes-ui';
import { IconX } from '@tabler/icons-react';
import { useFormMutate } from '../hooks/useFormMutate';

export const FormConfirmation = () => {
  const form = useForm<z.infer<typeof FORM_CONFIRMATION_SCHEMA>>({
    resolver: zodResolver(FORM_CONFIRMATION_SCHEMA),
    defaultValues: {
      title: 'Confirmation',
      description: 'Thank you for submitting the form',
      image: null,
    },
  });
  const { handleMutateForm, loading } = useFormMutate();

  const onSubmit = (confirmation: z.infer<typeof FORM_CONFIRMATION_SCHEMA>) => {
    handleMutateForm(confirmation);
  };

  return (
    <FormMutateLayout
      title="Confirmation"
      description="Confirmation settings"
      form={form}
      onSubmit={onSubmit}
      isLoading={loading}
    >
      <FormValueEffectComponent form={form} atom={formSetupConfirmationAtom} />
      <div className="px-5 space-y-5">
        <Form.Field
          name="title"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Title</Form.Label>
              <Form.Control>
                <Input {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          name="description"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Description</Form.Label>
              <Form.Control>
                <Textarea {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          name="image"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Image</Form.Label>
              <Form.Control>
                <FormConfirmationImage
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

export const FormConfirmationImage = ({
  value,
  onValueChange,
}: {
  value: IAttachment | null;
  onValueChange: (value: IAttachment | null) => void;
}) => {
  const { removeFile, isLoading } = useRemoveFile();
  const props = useErxesUpload({
    allowedMimeTypes: ['image/*'],
    maxFiles: 1,
    maxFileSize: 20 * 1024 * 1024,
    onFilesAdded: (addedFiles) => {
      onValueChange(addedFiles[0]);
    },
  });

  return value ? (
    <div className="relative p-2 border border-dashed rounded-md aspect-video">
      <img
        src={readImage(value.url)}
        alt="confirmation"
        className="w-full h-auto object-cover"
      />
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2"
        onClick={() =>
          removeFile(value.name, (status) => {
            if (status === 'ok') {
              onValueChange(null);
            }
          })
        }
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
