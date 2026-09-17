import { zodResolver } from '@hookform/resolvers/zod';
import { IconX } from '@tabler/icons-react';
import {
  Attachments,
  Button,
  Dialog,
  Editor,
  Form,
  IAttachment,
  Input,
  Separator,
  Spinner,
} from 'erxes-ui';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectBranches, SelectDepartments, SelectMember } from 'ui-modules';
import { useConversationContext } from '@/inbox/conversations/hooks/useConversationContext';
import { useConversationConvertToCard } from '@/inbox/conversations/hooks/useConversationConvertToCard';
import { ConversationConvertType } from '@/inbox/conversations/types/conversationConvert';
import { ConvertField, ConvertIdsField } from './ConvertFields';
import {
  ConvertProperties,
  TConvertPropertiesData,
  cleanConvertPropertiesData,
} from './ConvertPropertiesSection';
import { ConvertTargetFields } from './ConvertTargetFields';
import {
  CONVERT_TYPE_OPTIONS,
  TConvertForm,
  buildConvertSchema,
} from './convertForm';

const EMPTY_ATTACHMENTS: IAttachment[] = [];

const ConvertForm = ({
  type,
  title,
  onClose,
}: {
  type: ConversationConvertType;
  title: string;
  onClose: () => void;
}) => {
  const { t } = useTranslation('frontline');
  const { _id, assignedUserId, integration } = useConversationContext();
  const { convertToCard, loading } = useConversationConvertToCard();
  const [propertiesData, setPropertiesData] = useState<TConvertPropertiesData>(
    {},
  );
  const { multipleSelect, supportsDetails } = CONVERT_TYPE_OPTIONS[type];

  const namePlaceholders: Record<ConversationConvertType, string> = {
    ticket: t('add-a-new-ticket', 'Add a new ticket'),
    deal: t('add-a-new-deal', 'Add a new deal'),
    task: t('add-a-new-task', 'Add a new task'),
  };

  const schema = useMemo(() => buildConvertSchema(type), [type]);

  const form = useForm<TConvertForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      channelId: type === 'ticket' ? integration?.channelId || '' : '',
      boardId: '',
      pipelineId: '',
      teamId: '',
      stageId: '',
      name: '',
      assignedUserIds: assignedUserId ? [assignedUserId] : [],
      branchIds: [],
      departmentIds: [],
      attachments: [],
      description: '',
    },
  });

  const handleFieldChange = (fieldId: string, value: unknown) =>
    setPropertiesData((current) => ({ ...current, [fieldId]: value }));

  const onSubmit = async (data: TConvertForm) => {
    const details = supportsDetails
      ? {
          branchIds: data.branchIds,
          departmentIds: data.departmentIds,
          attachments: data.attachments,
        }
      : {};

    const itemId = await convertToCard({
      _id,
      type,
      itemName: data.name,
      stageId: data.stageId,
      assignedUserIds: data.assignedUserIds,
      description: data.description || undefined,
      customFieldsData: cleanConvertPropertiesData(propertiesData),
      ...details,
    });

    if (itemId) {
      onClose();
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex min-h-0 flex-1 flex-col"
      >
        <Dialog.Header className="relative flex-row items-start justify-between gap-4 space-y-0 border-b px-6 py-4 text-left">
          <div className="flex flex-col gap-1">
            <Dialog.Title className="text-base font-semibold">
              {title}
            </Dialog.Title>
            <Dialog.Description className="text-sm text-muted-foreground">
              {t(
                'convert-dialog-description',
                'Create a record from this conversation and link it back.',
              )}
            </Dialog.Description>
          </div>
          <Dialog.Close asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="flex-none"
              aria-label={t('close', 'Close')}
            >
              <IconX />
            </Button>
          </Dialog.Close>
        </Dialog.Header>
        <div className="max-h-[calc(90vh-9rem)] min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="flex flex-col gap-5 px-6 py-5">
            <ConvertTargetFields type={type} form={form} />
            <Form.Field
              name="name"
              control={form.control}
              render={({ field }) => (
                <ConvertField label={t('name', 'Name')} required>
                  <Form.Control>
                    <Input
                      {...field}
                      autoFocus
                      placeholder={namePlaceholders[type]}
                    />
                  </Form.Control>
                </ConvertField>
              )}
            />
            <ConvertIdsField
              form={form}
              name="assignedUserIds"
              label={t('assigned-to', 'Assigned to')}
              multiple={multipleSelect}
            >
              {(selectProps) => (
                <SelectMember.FormItem
                  {...selectProps}
                  placeholder={t('choose-users', 'Choose users')}
                />
              )}
            </ConvertIdsField>
            {supportsDetails && (
              <>
                <div className="grid gap-5 sm:grid-cols-2">
                  <ConvertIdsField
                    form={form}
                    name="branchIds"
                    label={t('branch-label', 'Branch')}
                    multiple={multipleSelect}
                  >
                    {(selectProps) => (
                      <SelectBranches.FormItem {...selectProps} />
                    )}
                  </ConvertIdsField>
                  <ConvertIdsField
                    form={form}
                    name="departmentIds"
                    label={t('department-label', 'Department')}
                    multiple={multipleSelect}
                  >
                    {(selectProps) => (
                      <SelectDepartments.FormItem {...selectProps} />
                    )}
                  </ConvertIdsField>
                </div>
                <Form.Field
                  name="attachments"
                  control={form.control}
                  render={({ field }) => (
                    <ConvertField label={t('attachments', 'Attachments')}>
                      <div className="flex flex-col gap-2 rounded-lg border border-dashed p-3">
                        <Attachments.Root
                          initialAttachments={EMPTY_ATTACHMENTS}
                          onSave={field.onChange}
                          confirmRemove={() => true}
                        >
                          <Attachments.Uploader
                            onSave={field.onChange}
                            label={t(
                              'upload-an-attachment',
                              'Upload an attachment',
                            )}
                          />
                          <Attachments.Files />
                          <Attachments.Preview />
                        </Attachments.Root>
                      </div>
                    </ConvertField>
                  )}
                />
              </>
            )}
            <Separator />
            <Form.Field
              name="description"
              control={form.control}
              render={({ field }) => (
                <ConvertField label={t('description', 'Description')}>
                  <Form.Control>
                    <Editor
                      initialContent={field.value}
                      onChange={field.onChange}
                      scope={`frontline-convert-${type}-description`}
                      className="min-h-32 rounded-lg border px-1 py-2"
                    />
                  </Form.Control>
                </ConvertField>
              )}
            />
            <Separator />
            <ConvertProperties
              type={type}
              propertiesData={propertiesData}
              onFieldChange={handleFieldChange}
              onNavigate={onClose}
            />
          </div>
        </div>
        <Dialog.Footer className="gap-2 border-t bg-muted/30 px-6 py-3">
          <Button type="button" variant="outline" onClick={onClose}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Spinner size="sm" />}
            {t('save', 'Save')}
          </Button>
        </Dialog.Footer>
      </form>
    </Form>
  );
};

export const ConvertDialog = ({
  type,
  title,
  onOpenChange,
}: {
  type: ConversationConvertType | null;
  title: string;
  onOpenChange: (open: boolean) => void;
}) => (
  <Dialog open={Boolean(type)} onOpenChange={onOpenChange}>
    <Dialog.Content className="flex max-h-[90vh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
      {type && (
        <ConvertForm
          type={type}
          title={title}
          onClose={() => onOpenChange(false)}
        />
      )}
    </Dialog.Content>
  </Dialog>
);
