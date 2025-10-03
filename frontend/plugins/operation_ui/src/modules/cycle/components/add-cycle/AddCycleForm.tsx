import { Form, Sheet, Input, Button } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addCycleSchema } from '@/cycle/validations';
import { ICycleInputType } from '@/cycle/types';
import { DateSelect } from '@/project/components/select';
import { useCreateCycle } from '@/cycle/hooks/useCreateCycle';
import { useParams } from 'react-router-dom';

export const AddCycleForm = ({ onClose }: { onClose: () => void }) => {
  const { teamId } = useParams();
  const { createCycle, loading } = useCreateCycle();
  const form = useForm<ICycleInputType>({
    resolver: zodResolver(addCycleSchema),
    defaultValues: {
      name: '',
      startDate: undefined,
      endDate: undefined,
      teamId: teamId,
    },
  });
  const onSubmit = (data: ICycleInputType) => {
    createCycle({
      variables: {
        input: {
          name: data.name,
          startDate: data.startDate,
          endDate: data.endDate,
          teamId: data.teamId,
        },
      },
      onCompleted: () => {
        onClose();
        form.reset();
      },
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="h-full flex flex-col"
      >
        <Sheet.Header className="flex items-center gap-2 ">
          <Sheet.Title className="">New cycle</Sheet.Title>
        </Sheet.Header>
        <Sheet.Content className="px-7 py-4 gap-2 flex flex-col">
          <Form.Field
            name="name"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label className="sr-only">Name</Form.Label>
                <Form.Control>
                  <Input
                    {...field}
                    className="shadow-none focus-visible:shadow-none h-8 text-xl p-0"
                    placeholder="Cycle Name"
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
          <div className="flex gap-2 w-full flex-wrap">
            <Form.Field
              name="startDate"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label className="sr-only">Start Date</Form.Label>
                  <DateSelect.FormItem
                    {...field}
                    type="start"
                    placeholder="Start Date"
                  />
                </Form.Item>
              )}
            />
            <Form.Field
              name="endDate"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label className="sr-only">Target Date</Form.Label>
                  <DateSelect.FormItem
                    {...field}
                    type="target"
                    placeholder="Target Date"
                  />
                </Form.Item>
              )}
            />
          </div>
        </Sheet.Content>
        <Sheet.Footer className="flex justify-end flex-shrink-0 gap-1 px-5">
          <Button
            type="button"
            variant="ghost"
            className="bg-background hover:bg-background/90"
            onClick={() => {
              onClose();
              form.reset();
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Save
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};
