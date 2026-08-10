import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, ScrollArea, Sheet, Form } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  loyaltyScoreFormSchema,
  LoyaltyScoreFormValues,
} from '../../constants/formSchema';
import { LoyaltyScoreAddCoreFields } from './LoyaltyScoreAddCoreFields';
import { LoyaltyScoreAddMoreFields } from './LoyaltyScoreAddMoreFields';
import {
  AddScoreCampaignVariables,
  useAddScoreCampaign,
} from '../hooks/useAddLoyaltyScore';

export function AddLoyaltyScoreForm({
  onOpenChange,
}: Readonly<{
  onOpenChange: (open: boolean) => void;
}>) {
  const { t } = useTranslation('loyalty');
  const { scoreCampaignAdd, loading: editLoading } = useAddScoreCampaign();
  const form = useForm<LoyaltyScoreFormValues>({
    resolver: zodResolver(loyaltyScoreFormSchema),
    defaultValues: {
      title: '',
      description: '',
      order: undefined,
      conditions: {
        serviceName: '',
        productCategoryIds: [],
        productIds: [],
        tagIds: [],
        excludeProductCategoryIds: [],
        excludeProductIds: [],
        excludeTagIds: [],
      },
      additionalConfig: {
        discountCheck: false,
        cardBasedRule: [
          { boardId: '', pipelineId: '', stageIds: [], refundStageIds: [] },
        ],
      },
      add: { placeholder: '', currencyRatio: '' },
      subtract: { placeholder: '', currencyRatio: '' },
      set: { placeholder: '', currencyRatio: '' },
      ownerType: '',
      onlyClientPortal: false,
      fieldGroupId: '',
      fieldOrigin: 'new' as const,
    },
  });

  async function onSubmit(data: LoyaltyScoreFormValues) {
    const cardBasedRule = (data.additionalConfig?.cardBasedRule || [])
      .filter((rule) => rule.boardId && rule.pipelineId)
      .map((rule) => ({
        boardId: rule.boardId,
        pipelineId: rule.pipelineId,
        stageIds: rule.stageIds || [],
        refundStageIds: rule.refundStageIds || [],
      }));

    const variables: AddScoreCampaignVariables = {
      title: data.title,
      description: data.description || '',
      order: data.order,
      serviceName: data.conditions.serviceName,
      restrictions: {
        productCategoryIds: data.conditions.productCategoryIds?.join(','),
        productIds: data.conditions.productIds?.join(','),
        tagIds: data.conditions.tagIds?.join(','),
        excludeProductCategoryIds:
          data.conditions.excludeProductCategoryIds?.join(','),
        excludeProductIds: data.conditions.excludeProductIds?.join(','),
        excludeTagIds: data.conditions.excludeTagIds?.join(','),
      },
      additionalConfig: {
        discountCheck: data.additionalConfig?.discountCheck ?? false,
        cardBasedRule,
      },
      add: data.add,
      subtract: data.subtract,
      set: data.set,
      ownerType: data.ownerType,
      onlyClientPortal: data.onlyClientPortal,
      fieldGroupId: data.fieldGroupId,
      fieldOrigin: data.fieldOrigin,
      fieldName: data.fieldName,
      fieldId: data.fieldId,
    };

    scoreCampaignAdd({
      variables,
      onCompleted: () => {
        form.reset();
        onOpenChange(false);
      },
    });
  }

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col h-full overflow-hidden"
      >
        <Sheet.Content className="flex-auto overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-5">
              <LoyaltyScoreAddCoreFields form={form} />
              <LoyaltyScoreAddMoreFields form={form} />
            </div>
          </ScrollArea>
        </Sheet.Content>

        <Sheet.Footer className="flex justify-end shrink-0 p-2.5 gap-1 bg-muted">
          <Button
            type="button"
            variant="ghost"
            className="bg-background hover:bg-background/90"
            onClick={handleCancel}
          >
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={editLoading}
          >
            {editLoading ? t('saving') : t('save')}
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
}
