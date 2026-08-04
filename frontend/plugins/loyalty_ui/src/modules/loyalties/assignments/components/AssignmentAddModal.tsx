import { Button, Sheet, Form, useToast } from 'erxes-ui';
import { IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import { SelectCustomer } from 'ui-modules';
import { useTranslation } from 'react-i18next';
import { ASSIGNMENTS_ADD_MUTATION } from '../graphql/mutations';
import { SelectAssignmentCampaignFormItem } from './selects/SelectAssignmentCampaign';

interface AssignmentAddFormValues {
  campaignId: string;
  ownerId: string;
}

export const AssignmentAddModal = () => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation('loyalty');

  const [addAssignment, { loading }] = useMutation(ASSIGNMENTS_ADD_MUTATION, {
    refetchQueries: ['AssignmentsMain'],
  });

  const form = useForm<AssignmentAddFormValues>({
    defaultValues: { campaignId: '', ownerId: '' },
  });

  const onSubmit = async (values: AssignmentAddFormValues) => {
    if (!values.campaignId || !values.ownerId) return;
    try {
      await addAssignment({
        variables: {
          campaignId: values.campaignId,
          ownerType: 'customer',
          ownerId: values.ownerId,
        },
      });
      toast({
        title: t('success'),
        description: t('assignment-created'),
        variant: 'default',
      });
      setOpen(false);
      form.reset();
    } catch (e: unknown) {
      toast({
        title: t('error'),
        description: e instanceof Error ? e.message : String(e),
        variant: 'destructive',
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen} modal>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          {t('add-assignment')}
        </Button>
      </Sheet.Trigger>
      <Sheet.View className="sm:max-w-md p-0">
        <Sheet.Header className="border-b gap-3 px-6 py-4">
          <Sheet.Title>{t('new-assignment')}</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="p-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <Form.Field
                control={form.control}
                name="campaignId"
                rules={{ required: t('campaign-required') }}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('campaign')}</Form.Label>
                    <SelectAssignmentCampaignFormItem
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder={t('choose-assignment-campaign')}
                    />
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="ownerId"
                rules={{ required: t('owner-required') }}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('owner-label')}</Form.Label>
                    <Form.Control>
                      <SelectCustomer
                        value={field.value ? [field.value] : []}
                        onValueChange={(val) =>
                          field.onChange(Array.isArray(val) ? val[0] : val)
                        }
                        mode="single"
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  {t('close')}
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? t('saving') : t('save')}
                </Button>
              </div>
            </form>
          </Form>
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
