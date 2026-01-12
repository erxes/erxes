import { FormMutateLayout } from './FormMutateLayout';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FORM_CONFIRMATION_SCHEMA } from '../constants/formSchema';
import { FormValueEffectComponent } from './FormValueEffectComponent';
import {
  formSetupConfirmationAtom,
  formSetupGeneralAtom,
  formSetupContentAtom,
} from '../states/formSetupStates';
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
} from 'erxes-ui';
import { IconX } from '@tabler/icons-react';
import { useFormAdd, useFormFieldAdd } from '../hooks/useFormAdd';
import { useParams } from 'react-router';
import { useAtomValue } from 'jotai';

export const FormConfirmation = () => {
  const params = useParams();
  const form = useForm<z.infer<typeof FORM_CONFIRMATION_SCHEMA>>({
    resolver: zodResolver(FORM_CONFIRMATION_SCHEMA),
    defaultValues: {
      title: 'Confirmation',
      description: 'Thank you for submitting the form',
      image: null,
    },
  });
  const formGeneral = useAtomValue(formSetupGeneralAtom);
  const formConfirmation = useAtomValue(formSetupConfirmationAtom);
  const formContent = useAtomValue(formSetupContentAtom);
  const { addForm } = useFormAdd();
  const { addFormField } = useFormFieldAdd();

  const onSubmit = () => {
    addForm({
      variables: {
        title: formGeneral.title,
        name: formGeneral.title,
        type: 'lead',
        channelId: params.channelId,
        description: formConfirmation.description,
        buttonText: formGeneral.buttonText,
        numberOfPages: formContent.steps.length,
        leadData: {
          appearance: formGeneral.appearance,
          thankTitle: formConfirmation.title,
          thankContent: formConfirmation.description,
          thankImage: formConfirmation.image,
          primaryColor: formGeneral.primaryColor,
          successImage: formConfirmation.image,
          steps: Object.fromEntries(
            Object.entries(formContent.steps).map(([key, step]) => [
              key,
              {
                name: step.name,
                description: step.description,
                order: step.order,
              },
            ]),
          ),
        },
      },
      onCompleted: (data) => {
        const formId = data.formsAdd._id;
        console.log(formContent.steps);
        const allFormFields = Object.entries(formContent.steps)
          .map(([key, step]) => {
            return step.fields.map((field) => {
              return {
                ...field,
                stepId: key,
              };
            });
          })
          .flat();

        allFormFields.map((field) => {
          addFormField({
            variables: {
              contentType: 'form',
              contentTypeId: formId,
              type: field.type,
              validation: field.validation,
              text: field.label,
              description: field.description,
              options: field.options,
              isRequired: field.required,
              order: field.order + (field.span === 2 ? 0.5 : 0),
              groupId: field.stepId,
            },
          });
        });
      },
    });
  };

  return (
    <FormMutateLayout
      title="Confirmation"
      description="Confirmation settings"
      form={form}
      onSubmit={onSubmit}
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
    <div className="relative p-2 border border-dashed rounded-md">
      <img
        src={value.url}
        alt="confirmation"
        className="w-full h-full object-cover"
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
