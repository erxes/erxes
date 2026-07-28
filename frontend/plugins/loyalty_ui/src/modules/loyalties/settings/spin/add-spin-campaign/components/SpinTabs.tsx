import { ApolloError } from '@apollo/client';
import { Button, Form, Sheet, useToast } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SpinFormValues } from '../../constants/spinFormSchema';
import { useAddSpin } from '../../hooks/useAddSpin';
import { AddSpinCampaignForm } from './AddSpinCampaignForm';

type Props = {
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<SpinFormValues>;
};

export const SpinTabs = ({ onOpenChange, form }: Props) => {
  const { t } = useTranslation('loyalty');
  const { spinAdd, loading: editLoading } = useAddSpin();
  const { toast } = useToast();

  const handleSubmit = async () => {
    const data = form.getValues();

    const formatDate = (date: string | Date | undefined): string => {
      if (!date) return '';
      if (date instanceof Date) {
        return date.toISOString();
      }
      return date;
    };

    const variables: any = {
      title: data.title || '',
      status: data.status || 'active',
      startDate: formatDate(data.startDate),
      endDate: formatDate(data.endDate),
      buyScore: data.buyScore,

      awards: data.awards?.map((award) => ({
        name: award.name,
        probability: award.probability,
        voucherCampaignId: award.voucherCampaignId,
      })),
    };

    spinAdd({
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
          <AddSpinCampaignForm onOpenChange={onOpenChange} form={form} />
        </div>
        {renderFooter()}
      </div>
    </Form>
  );
};
