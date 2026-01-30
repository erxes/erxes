import { UseFormReturn } from 'react-hook-form';
import {
  Button,
  Dialog,
  Form,
  Input,
  Select,
  Spinner,
} from 'erxes-ui';

export const SyncDealConfigForm = ({
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
