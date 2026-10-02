import { defaultSubtract, toSubtractInput } from '../../utils/spendRulesForm';
import { ScoreCampaignFormLayout } from './ScoreCampaignFormLayout';
import { defaultEarnTable, toAddInput } from '../../utils/earnTableForm';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Sheet, Form } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  loyaltyScoreFormSchema,
  LoyaltyScoreFormValues,
} from '../../constants/formSchema';
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
        productCategoryIds: [],
        productIds: [],
        tagIds: [],
        excludeProductCategoryIds: [],
        excludeProductIds: [],
        excludeTagIds: [],
      },
      additionalConfig: {
        discountCheck: false,
      },
      add: { table: defaultEarnTable() },
      subtract: defaultSubtract(),
      accountTypeId: '',
    },
  });

  async function onSubmit(data: LoyaltyScoreFormValues) {
    const variables: AddScoreCampaignVariables = {
      title: data.title,
      description: data.description || '',
      order: data.order,
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
      },
      add: toAddInput(data.add),
      subtract: toSubtractInput(data.subtract),
      accountTypeId: data.accountTypeId || '',
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
        className="flex flex-col flex-1 min-h-0 overflow-hidden"
      >
        <ScoreCampaignFormLayout form={form} />

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
