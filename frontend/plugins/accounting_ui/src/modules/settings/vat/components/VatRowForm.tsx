import { UseFormReturn } from 'react-hook-form';
import {
  TVatRowForm,
  VatKind,
  VAT_KIND_LABELS,
  VatStatus,
  VAT_STATUS_LABELS,
} from '../types/VatRow';
import {
  Button,
  Checkbox,
  Form,
  Input,
  Select,
  Sheet,
  Spinner,
} from 'erxes-ui';

export const VatRowForm = ({
  form,
  onSubmit,
  loading,
}: {
  form: UseFormReturn<TVatRowForm>;
  onSubmit: (data: TVatRowForm) => void;
  loading: boolean;
  onClose?: () => void;
}) => {
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col flex-1 bg-background min-h-0"
      >
        <div className="flex-1 min-h-0 overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-5">
            <Form.Field
              control={form.control}
              name="number"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Дугаар</Form.Label>
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="name"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Нэр</Form.Label>
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="kind"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Төрөл</Form.Label>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <Form.Control>
                      <Select.Trigger>
                        <Select.Value placeholder="Төрөл сонгох" />
                      </Select.Trigger>
                    </Form.Control>
                    <Select.Content>
                      {Object.values(VatKind).map((kind) => (
                        <Select.Item
                          key={kind}
                          value={kind}
                          className="capitalize"
                        >
                          {VAT_KIND_LABELS[kind]}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="percent"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Хувь</Form.Label>
                  <Form.Control>
                    <Input
                      type="number"
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      min={0}
                      max={100}
                    />
                  </Form.Control>
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="status"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Төлөв</Form.Label>

                  <Select value={field.value} onValueChange={field.onChange}>
                    <Form.Control>
                      <Select.Trigger>
                        <Select.Value placeholder="Төлөв сонгох" />
                      </Select.Trigger>
                    </Form.Control>
                    <Select.Content>
                      {Object.values(VatStatus).map((status) => (
                        <Select.Item
                          key={status}
                          value={status}
                          className="capitalize"
                        >
                          {VAT_STATUS_LABELS[status]}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </Form.Item>
              )}
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
