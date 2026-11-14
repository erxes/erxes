import { IconAlignLeft, IconPhoto, IconUserCircle } from '@tabler/icons-react';
import { Editor, Form, useToast } from 'erxes-ui';
import { type ReactNode, useState } from 'react';
import {
  type FieldValues,
  type SubmitHandler,
  useFormContext,
  type UseFormReturn,
} from 'react-hook-form';
import { AvatarUploadField } from '~/components/AvatarEditor';
import { DESCRIPTION_MAX } from '@erxes/core-contract';
import { z } from 'zod';
import { messageOf } from '@erxes/core-contract/client';
import { SelectMember } from '~/modules/contacts/components/SelectMember';
import { type ContactSide, linkNewContact } from '~/modules/contacts/components/useContactLinks';
import { PanelFormLayout, PanelFormRow } from '../PanelForm';
import { useCreatedPanelRecord } from '../useCreatedPanelRecord';
import { useSidePanel } from '../useSidePanel';

/** The fields every new contact's form has. */
interface ContactFormFields {
  avatarUrl?: string | null;
  ownerId?: string;
  description?: string;
}

/**
 * Links a contact just created to the records picked in its draft, then shows
 * it. A failed link still opens the contact, so Save cannot create a duplicate.
 */
export const useFinishCreate = (side: ContactSide, linkErrorTitle: string) => {
  const { toast } = useToast();
  const [linking, setLinking] = useState(false);
  const showCreated = useCreatedPanelRecord(side);

  const finish = async (id: string, relatedIds: string[]) => {
    if (relatedIds.length) {
      setLinking(true);
      await linkNewContact(side, id, relatedIds).catch((error: unknown) =>
        toast({ variant: 'destructive', title: linkErrorTitle, description: messageOf(error) }),
      );
      setLinking(false);
    }

    showCreated(id);
  };

  return { linking, finish };
};

/** A new contact's form: its rows, then Cancel (back, or close at the top) and Save. */
export const NewContactForm = <T extends FieldValues>({
  form,
  onSave,
  saving,
  saveLabel,
  children,
}: {
  form: UseFormReturn<T>;
  onSave: SubmitHandler<T>;
  saving: boolean;
  saveLabel: string;
  children: ReactNode;
}) => {
  const { back, canGoBack, close } = useSidePanel();

  return (
    <Form {...form}>
      <form
        className="mx-auto flex w-full max-w-2xl flex-1 min-h-0 flex-col"
        onSubmit={(event) => void form.handleSubmit(onSave)(event)}
      >
        <PanelFormLayout
          onCancel={() => (canGoBack ? back() : close())}
          saving={saving}
          saveLabel={saveLabel}
        >
          {children}
        </PanelFormLayout>
      </form>
    </Form>
  );
};

export const ContactAvatarRow = ({ label }: { label: string }) => {
  const { control } = useFormContext<ContactFormFields>();

  return (
    <PanelFormRow icon={IconPhoto} label={label}>
      <Form.Field
        control={control}
        name="avatarUrl"
        render={({ field }) => (
          <AvatarUploadField value={field.value ?? null} onChange={field.onChange} />
        )}
      />
    </PanelFormRow>
  );
};

export const ContactOwnerRow = ({ label }: { label: string }) => {
  const { control } = useFormContext<ContactFormFields>();

  return (
    <PanelFormRow icon={IconUserCircle} label={label}>
      <Form.Field
        control={control}
        name="ownerId"
        render={({ field }) => (
          <SelectMember.FormItem
            placeholder={label}
            value={field.value}
            onValueChange={(value) => field.onChange(value ?? '')}
          />
        )}
      />
    </PanelFormRow>
  );
};

/**
 * A new contact's description: editor JSON, held to the contract's limit, so Save
 * stops it here instead of sending what the server refuses.
 */
export const contactDescription = z
  .string()
  .max(DESCRIPTION_MAX, 'The description is too long. Shorten it to save.');

/** The description editor under a new contact's rows, with its error. */
export const ContactDescriptionRow = ({ label, scope }: { label: string; scope: string }) => {
  const { control, formState } = useFormContext<ContactFormFields>();
  const error = formState.errors.description?.message;

  return (
    <div className="flex flex-col gap-1.5 pt-2">
      <span className="flex items-center gap-1.5 text-xs font-medium text-accent-foreground">
        <IconAlignLeft className="size-3.5" aria-hidden="true" />
        {label}
      </span>
      <Form.Field
        control={control}
        name="description"
        render={({ field }) => (
          <Editor
            initialContent={field.value}
            onChange={field.onChange}
            scope={scope}
            label={label}
          />
        )}
      />
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
};
