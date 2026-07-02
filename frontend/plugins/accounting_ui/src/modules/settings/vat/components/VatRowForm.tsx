import { UseFormReturn } from 'react-hook-form';
import {
  TVatRowForm,
  VatKind,
  VAT_KIND_LABELS,
  VatStatus,
  VAT_STATUS_LABELS,
} from '../types/VatRow';
import { Button, Checkbox, Form, Input, Sheet, Spinner } from 'erxes-ui';
import { TaxRowCommonFields } from '../../components/TaxRowCommonFields';

export const VatRowForm = ({
  form,
  onSubmit,
  loading,
}: {
  form: UseFormReturn<TVatRowForm>;
  onSubmit: (data: TVatRowForm) => void;
  loading: boolean;
}) => {
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col flex-1 bg-background min-h-0"
      >
        <div className="flex-1 min-h-0 overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-5">
            <TaxRowCommonFields
              control={form.control}
              kinds={Object.values(VatKind)}
              kindLabels={VAT_KIND_LABELS}
              statuses={Object.values(VatStatus)}
              statusLabels={VAT_STATUS_LABELS}
            />

            <Form.Field
              control={form.control}
              name="tabCount"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Доголын тоо</Form.Label>
                  <Form.Control>
                    <Input
                      type="number"
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      min={0}
                    />
                  </Form.Control>
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="isBold"
              render={({ field }) => (
                <Form.Item className="col-span-2 flex items-center gap-2 space-y-0">
                  <Form.Control>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </Form.Control>
                  <Form.Label variant="peer">Тод бичих</Form.Label>
                </Form.Item>
              )}
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
