import { UseFormReturn } from 'react-hook-form';
import {
  Button,
  Dialog,
  Form,
  Input,
  Select,
  Spinner,
} from 'erxes-ui';

export const SyncOrderConfigForm = ({
  form,
  onSubmit,
  loading,
}: {
  form: UseFormReturn<any>;
  onSubmit: (data: any) => void;
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
          name="title"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Title</Form.Label>
              <Form.Control>
                <Input {...field} />
              </Form.Control>
            </Form.Item>
          )}
        />

        <Form.Field
          control={form.control}
          name="percent"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Percent</Form.Label>
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
        <Dialog.Footer className="col-span-2 mt-3 gap-2">
          <Dialog.Close asChild>
            <Button variant="outline" size="lg">
              Cancel
            </Button>
          </Dialog.Close>
          <Button type="submit" disabled={loading} size="lg">
            {loading ? <Spinner /> : 'Submit'}
          </Button>
        </Dialog.Footer>
      </form>
    </Form>
  );
};
