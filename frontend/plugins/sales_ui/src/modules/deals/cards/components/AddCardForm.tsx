import {
  Button,
  Editor,
  Form,
  Input,
  ScrollArea,
  Sheet,
  Spinner,
} from 'erxes-ui';
import { SalesFormType, salesFormSchema } from '@/deals/constants/formSchema';
import {
  isFieldVisibleByLogic,
  PropertyFormField,
  SelectCompany,
  SelectCustomer,
  SelectMember,
  useFields,
} from 'ui-modules';

import { SelectLabels } from '../../components/common/filters/SelectLabel';
import WorkflowFields from './WorkflowFields';
import { useDealsAdd } from '@/deals/cards/hooks/useDeals';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

export function AddCardForm({
  onCloseSheet,
  onComplete,
  showWorkflowFields,
}: {
  onCloseSheet: () => void;
  onComplete?: (dealId: string) => void;
  showWorkflowFields?: boolean;
}) {
  const form = useForm<SalesFormType>({
    resolver: zodResolver(salesFormSchema),
    defaultValues: {
      name: '',
      assignedUserIds: [],
      description: '',
      companyIds: [],
      customerIds: [],
      labelIds: [],
      tagIds: [],
      propertiesData: {},
    },
  });
  const { addDeals, loading } = useDealsAdd();

  const updateCustomFieldValue = useCallback(
    (fieldId: string, value: unknown) => {
      const current = form.getValues('propertiesData') || {};
      form.setValue('propertiesData', { ...current, [fieldId]: value });
    },
    [form],
  );

  const onSubmit = ({ propertiesData, ...rest }: SalesFormType) => {
    const cleanPropertiesData =
      propertiesData && Object.keys(propertiesData).length > 0
        ? Object.fromEntries(
            Object.entries(propertiesData).filter(
              ([, v]) => v !== undefined && v !== null && v !== '',
            ),
          )
        : undefined;

    addDeals({
      variables: {
        ...rest,
        propertiesData: cleanPropertiesData,
      },
      onCompleted: (data) => {
        form.reset();
        onCloseSheet();
        onComplete?.(data.dealsAdd._id);
      },
    });
  };

  const propertiesData = form.watch('propertiesData') || {};

  const { t } = useTranslation('sales');

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col h-full overflow-hidden"
      >
        <Sheet.Header className="p-5">
          <Sheet.Title>{t('add-deal')}</Sheet.Title>
          <Sheet.Description className="sr-only">
            {t('add-new-deal-to-stage')}
          </Sheet.Description>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="overflow-y-auto">
          <ScrollArea className="flex-auto">
            <div className="p-5">
              <div className="grid grid-cols-1 gap-2">
                <Form.Field
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t('name')}</Form.Label>
                      <Form.Control>
                        <Input {...field} required />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <Form.Item className="mb-5">
                      <Form.Label>{t('description')}</Form.Label>

                      <Form.Control>
                        <Editor
                          initialContent={field.value}
                          onChange={field.onChange}
                          scope="sales-add-sheet-description-field"
                        />
                      </Form.Control>
                      <Form.Message className="text-destructive" />
                    </Form.Item>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {showWorkflowFields && (
                  <WorkflowFields control={form.control} />
                )}
                <Form.Field
                  control={form.control}
                  name="assignedUserIds"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t('assigned-to')}</Form.Label>
                      <Form.Control>
                        <SelectMember.FormItem
                          mode="multiple"
                          value={field.value}
                          onValueChange={field.onChange}
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={form.control}
                  name="labelIds"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t('select-label')}</Form.Label>
                      <Form.Control>
                        <SelectLabels.FormItem
                          mode="multiple"
                          value={field.value}
                          onValueChange={field.onChange}
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={form.control}
                  name="companyIds"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t('select-companies')}</Form.Label>
                      <Form.Control>
                        <SelectCompany
                          mode="multiple"
                          value={field.value}
                          onValueChange={field.onChange}
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={form.control}
                  name={'customerIds'}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t('select-customers')}</Form.Label>
                      <SelectCustomer.FormItem
                        mode="multiple"
                        value={field.value}
                        onValueChange={field.onChange}
                      />
                    </Form.Item>
                  )}
                />
              </div>
              <DealPropertiesSection
                propertiesData={propertiesData}
                onFieldChange={updateCustomFieldValue}
              />
            </div>
          </ScrollArea>
        </Sheet.Content>
        <Sheet.Footer className="flex justify-end shrink-0 px-5 gap-1">
          <Button
            type="button"
            variant="ghost"
            className="bg-background hover:bg-background/90"
            onClick={() => onCloseSheet()}
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
          >
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={loading}
          >
            {loading ? t('saving') : t('save')}
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
}

function DealPropertiesSection({
  propertiesData,
  onFieldChange,
}: Readonly<{
  propertiesData: Record<string, unknown>;
  onFieldChange: (fieldId: string, value: unknown) => void;
}>) {
  const { fields, loading } = useFields({ contentType: 'sales:deal' });

  const visibleFields = fields
    .filter((field) => field.isVisibleToCreate)
    .filter((field) => isFieldVisibleByLogic(field, propertiesData));

  if (loading) {
    return <Spinner containerClassName="py-6" />;
  }

  if (visibleFields.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      {visibleFields.map((field) => (
        <PropertyFormField
          key={field._id}
          field={field}
          value={propertiesData[field._id]}
          idPrefix="deal_add_form"
          onFieldChange={onFieldChange}
        />
      ))}
    </div>
  );
}
