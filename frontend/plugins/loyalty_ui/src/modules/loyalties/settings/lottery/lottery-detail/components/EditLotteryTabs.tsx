import { ApolloError } from '@apollo/client';
import { Button, Form, Sheet, useToast } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { AddLotteryCampaignForm } from '../../add-lottery-campaign/components/AddLotteryCampaignForm';
import { LotteryFormValues } from '../../constants/lotteryFormSchema';
import { useEditLottery } from '../../hooks/useEditLottery';

type Props = {
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<LotteryFormValues>;
  lotteryId: string | null;
};

export const EditLotteryTabs = ({ onOpenChange, form, lotteryId }: Props) => {
  const { t } = useTranslation('loyalty');
  const { lotteryEdit, loading: editLoading } = useEditLottery();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!lotteryId) {
      toast({
        title: t('error'),
        description: t('no-lottery-id-provided'),
        variant: 'destructive',
      });
      return;
    }

    const data = form.getValues();

    const formatDate = (date: string | Date | undefined): string => {
      if (!date) return '';
      if (date instanceof Date) {
        return date.toISOString();
      }
      return date;
    };

    const variables: any = {
      _id: lotteryId,
      title: data.title || '',
      description: data.description || '',
      status: data.status || 'active',
      startDate: formatDate(data.startDate),
      endDate: formatDate(data.endDate),
      buyScore: data.buyScore,
      numberFormat: data.numberFormat || '',

      awards: data.awards?.map((award) => ({
        name: award.name,
        voucherCampaignId: award.voucherCampaignId,
        count: award.count,
      })),
    };

    lotteryEdit({
      variables,
      onError: (e: ApolloError) => {
        toast({
          title: t('error'),
          description: e.message,
          variant: 'destructive',
        });
      },
      onCompleted: () => {
        form.reset();
        onOpenChange(false);
      },
    });
  };

  const renderFooter = () => (
    <Sheet.Footer className="flex justify-end shrink-0 p-2.5 gap-1 bg-muted border-t">
      <Button
        type="button"
        variant="ghost"
        className="bg-background hover:bg-background/90"
        onClick={() => onOpenChange(false)}
      >
        {t('cancel')}
      </Button>
      <Button
        type="button"
        className="bg-primary text-primary-foreground hover:bg-primary/90"
        onClick={handleSubmit}
        disabled={editLoading}
      >
        {editLoading ? t('saving') : t('save')}
      </Button>
    </Sheet.Footer>
  );

  return (
    <Form {...form}>
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-auto overflow-hidden py-4 px-5">
          <AddLotteryCampaignForm form={form} />
        </div>
        {renderFooter()}
      </div>
    </Form>
  );
};
