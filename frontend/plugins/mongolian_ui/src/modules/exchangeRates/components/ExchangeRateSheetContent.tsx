import { Button, Sheet, Spinner } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { TExchangeRateForm } from '../constants';
import { ExchangeRateFormFields } from './ExchangeRateFormFields';

type Props = {
  title: string;
  formId: string;
  form: UseFormReturn<TExchangeRateForm>;
  loading?: boolean;
  onSubmit: (values: TExchangeRateForm) => void;
};

export const ExchangeRateSheetContent = ({
  title,
  formId,
  form,
  loading,
  onSubmit,
}: Props) => (
  <Sheet.View className="bg-background sm:max-w-lg">
    <Sheet.Header>
      <Sheet.Title>{title}</Sheet.Title>
      <Sheet.Close />
    </Sheet.Header>
    <div className="flex-1 overflow-y-auto px-5 py-4">
      <ExchangeRateFormFields form={form} formId={formId} onSubmit={onSubmit} />
    </div>
    <Sheet.Footer className="gap-2 border-t bg-background">
      <Sheet.Close asChild>
        <Button variant="outline" size="lg">
          Cancel
        </Button>
      </Sheet.Close>
      <Button type="submit" form={formId} size="lg" disabled={loading}>
        {loading ? <Spinner /> : 'Save'}
      </Button>
    </Sheet.Footer>
  </Sheet.View>
);
