import { UseFormReturn } from 'react-hook-form';
import {
  TCtaxRowForm,
  CtaxKind,
  CTAX_KIND_LABELS,
  CtaxStatus,
  CTAX_STATUS_LABELS,
} from '../types/CtaxRow';
import { Button, Dialog, Form, Input, Select, Spinner } from 'erxes-ui';
import { IconX } from '@tabler/icons-react';

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
        className="grid gap-5 grid-cols-2 py-3"
      >
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
                  {Object.values(CtaxKind).map((kind) => (
                    <Select.Item key={kind} value={kind} className="capitalize">
                      {CTAX_KIND_LABELS[kind]}
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
                  {Object.values(CtaxStatus).map((status) => (
                    <Select.Item
                      key={status}
                      value={status}
                      className="capitalize"
                    >
                      {CTAX_STATUS_LABELS[status]}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </Form.Item>
          )}
        />
        <Dialog.Footer className="col-span-2 mt-3 gap-2">
          <Dialog.Close asChild>
            <Button variant="outline" size="lg">
              Болих
            </Button>
          </Dialog.Close>
          <Button type="submit" disabled={loading} size="lg">
            {loading ? <Spinner /> : 'Хадгалах'}
          </Button>
        </Dialog.Footer>
      </form>
    </Form>
  );
};

export const CtaxRowDialog = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) => {
  return (
    <Dialog.Content className="max-w-2xl">
      <Dialog.Header>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Description className="sr-only">
          {description}
        </Dialog.Description>
        <Dialog.Close asChild>
          <Button
            variant="secondary"
            size="icon"
            className="absolute right-4 top-3"
          >
            <IconX />
          </Button>
        </Dialog.Close>
      </Dialog.Header>
      {children}
    </Dialog.Content>
  );
};
