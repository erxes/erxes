import { UseFormReturn } from 'react-hook-form';
import {
  TCtaxRowForm,
  CtaxKind,
  CTAX_KIND_LABELS,
  CtaxStatus,
  CTAX_STATUS_LABELS,
} from '../types/CtaxRow';
import { Button, Form, Sheet, Spinner } from 'erxes-ui';
import { TaxRowCommonFields } from '../../components/TaxRowCommonFields';

export const CtaxRowForm = ({
  form,
  onSubmit,
  loading,
}: {
  form: UseFormReturn<TCtaxRowForm>;
  onSubmit: (data: TCtaxRowForm) => void;
  loading: boolean;
}) => {
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col flex-1 bg-background min-h-0"
      >
        <div className="p-3 flex-1 min-h-0 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <TaxRowCommonFields
              control={form.control}
              kinds={Object.values(CtaxKind)}
              kindLabels={CTAX_KIND_LABELS}
              statuses={Object.values(CtaxStatus)}
              statusLabels={CTAX_STATUS_LABELS}
              statusColSpan
            />
          </div>
        </div>
        <Sheet.Footer className="shrink-0 border-t bg-background">
          <Sheet.Close asChild>
            <Button variant="outline" size="lg">
              Болих
            </Button>
          </Sheet.Close>
          <Button type="submit" disabled={loading} size="lg">
            {loading ? <Spinner /> : 'Хадгалах'}
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};
